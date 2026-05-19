<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MessageController extends Controller
{
    /**
     * Chat-style inbox: list conversations grouped by counterpart user.
     * Optional ?with={user_id} loads the active conversation thread.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->string('search')->toString();
        $partnerId = $request->integer('with') ?: null;

        $conversations = $this->buildConversationList($user, $search);
        $activePartner = null;
        $thread = [];

        if ($partnerId) {
            $partner = User::query()->find($partnerId, ['id', 'name', 'email', 'avatar_path']);

            if ($partner) {
                $messages = $this->fetchConversation($user, $partner);
                $this->markIncomingAsRead($user, $partner);

                $activePartner = [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'email' => $partner->email,
                    'avatar_url' => $partner->avatar_url,
                ];

                $thread = $messages->map(fn (Message $m) => [
                    'id' => $m->id,
                    'body' => $m->body,
                    'subject' => $m->subject,
                    'created_at' => $m->created_at?->toIso8601String(),
                    'is_self' => $m->sender_id === $user->id,
                ])->all();
            }
        }

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
            'activePartner' => $activePartner,
            'thread' => $thread,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildConversationList(User $user, string $search = ''): array
    {
        // Pair messages by (least(sender,recipient), greatest(sender,recipient)) so both directions live in one row.
        $partnerExpr = DB::raw("CASE WHEN sender_id = {$user->id} THEN recipient_id ELSE sender_id END AS partner_id");

        $latestMessages = Message::query()
            ->select(['id', 'sender_id', 'recipient_id', 'subject', 'body', 'created_at', 'read_at'])
            ->where(function ($q) use ($user) {
                $q->where(function ($q1) use ($user) {
                    $q1->where('sender_id', $user->id)->where('sender_deleted', false);
                })->orWhere(function ($q1) use ($user) {
                    $q1->where('recipient_id', $user->id)->where('recipient_deleted', false);
                });
            })
            ->orderByDesc('id')
            ->get()
            ->groupBy(fn (Message $m) => $m->sender_id === $user->id ? $m->recipient_id : $m->sender_id);

        if ($latestMessages->isEmpty()) {
            return [];
        }

        $partnerIds = $latestMessages->keys()->all();
        $partners = User::query()
            ->whereIn('id', $partnerIds)
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->get(['id', 'name', 'email', 'avatar_path'])
            ->keyBy('id');

        return collect($partnerIds)
            ->map(function ($partnerId) use ($latestMessages, $partners, $user) {
                $partner = $partners->get($partnerId);
                if (! $partner) {
                    return null;
                }

                $messages = $latestMessages[$partnerId];
                $last = $messages->first();
                $unread = $messages
                    ->where('recipient_id', $user->id)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'partner' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'email' => $partner->email,
                        'avatar_url' => $partner->avatar_url,
                    ],
                    'last_message' => [
                        'id' => $last->id,
                        'preview' => str($last->body)->limit(80)->toString(),
                        'is_self' => $last->sender_id === $user->id,
                        'created_at' => $last->created_at?->toIso8601String(),
                    ],
                    'unread_count' => $unread,
                ];
            })
            ->filter()
            ->sortByDesc(fn ($c) => $c['last_message']['created_at'])
            ->values()
            ->all();
    }

    private function fetchConversation(User $user, User $partner)
    {
        return Message::query()
            ->where(function ($q) use ($user, $partner) {
                $q->where(function ($q1) use ($user, $partner) {
                    $q1->where('sender_id', $user->id)
                        ->where('recipient_id', $partner->id)
                        ->where('sender_deleted', false);
                })->orWhere(function ($q1) use ($user, $partner) {
                    $q1->where('sender_id', $partner->id)
                        ->where('recipient_id', $user->id)
                        ->where('recipient_deleted', false);
                });
            })
            ->orderBy('created_at')
            ->get();
    }

    private function markIncomingAsRead(User $user, User $partner): void
    {
        Message::query()
            ->where('recipient_id', $user->id)
            ->where('sender_id', $partner->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function create(Request $request): Response
    {
        $recipients = User::query()
            ->where('id', '!=', $request->user()->id)
            ->where('status', 'active')
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name', 'email']);

        $replyTo = null;
        if ($request->filled('reply_to')) {
            $source = Message::query()
                ->where('id', $request->integer('reply_to'))
                ->where(function ($q) use ($request) {
                    $q->where('recipient_id', $request->user()->id)
                        ->orWhere('sender_id', $request->user()->id);
                })
                ->with('sender:id,name,email')
                ->first();

            if ($source) {
                $replyTo = [
                    'id' => $source->id,
                    'sender' => $source->sender,
                    'subject' => str_starts_with($source->subject, 'Re:') ? $source->subject : "Re: {$source->subject}",
                    'quote' => str($source->body)->limit(500)->toString(),
                ];
            }
        }

        return Inertia::render('messages/compose', [
            'recipients' => $recipients,
            'replyTo' => $replyTo,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'subject' => ['nullable', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:messages,id'],
        ], [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
            'exists' => ':attribute tidak ditemukan.',
        ], [
            'recipient_id' => 'Penerima',
            'subject' => 'Subjek',
            'body' => 'Isi pesan',
        ]);

        if ((int) $data['recipient_id'] === $request->user()->id) {
            return back()
                ->withErrors(['recipient_id' => 'Tidak bisa mengirim pesan ke diri sendiri.'])
                ->withInput();
        }

        // Chat-style: if there's a prior message with this partner, inherit the subject
        // so we don't force users to fill a topic for every reply.
        if (empty($data['subject'])) {
            $previous = Message::query()
                ->where(function ($q) use ($data, $request) {
                    $q->where(function ($q1) use ($data, $request) {
                        $q1->where('sender_id', $request->user()->id)
                            ->where('recipient_id', $data['recipient_id']);
                    })->orWhere(function ($q1) use ($data, $request) {
                        $q1->where('sender_id', $data['recipient_id'])
                            ->where('recipient_id', $request->user()->id);
                    });
                })
                ->latest('id')
                ->first();

            $data['subject'] = $previous
                ? (str_starts_with($previous->subject, 'Re:') ? $previous->subject : "Re: {$previous->subject}")
                : '(Tanpa subjek)';
        }

        $message = Message::create([
            ...$data,
            'sender_id' => $request->user()->id,
        ]);

        $recipient = User::find($data['recipient_id']);
        $recipient?->notify(new NewMessageReceived($message));

        // Chat-style requests come from /messages?with=… so redirect back into the conversation.
        if ($request->boolean('chat')) {
            return redirect()
                ->route('messages.index', ['with' => $data['recipient_id']])
                ->with('success', 'Pesan terkirim.');
        }

        return redirect()
            ->route('messages.index', ['with' => $data['recipient_id']])
            ->with('success', 'Pesan terkirim.');
    }

    public function show(Request $request, Message $message): SymfonyResponse
    {
        $user = $request->user();
        abort_unless($message->sender_id === $user->id || $message->recipient_id === $user->id, 403);

        // Redirect single-message view into the chat thread with the counterpart.
        $partnerId = $message->sender_id === $user->id ? $message->recipient_id : $message->sender_id;

        return Inertia::location(route('messages.index', ['with' => $partnerId]));
    }

    public function destroy(Request $request, Message $message): RedirectResponse
    {
        $user = $request->user();

        if ($message->sender_id === $user->id) {
            $message->update(['sender_deleted' => true]);
        } elseif ($message->recipient_id === $user->id) {
            $message->update(['recipient_deleted' => true]);
        } else {
            abort(403);
        }

        if ($message->sender_deleted && $message->recipient_deleted) {
            $message->delete();
        }

        return redirect()
            ->route('messages.index')
            ->with('success', 'Pesan dihapus.');
    }
}
