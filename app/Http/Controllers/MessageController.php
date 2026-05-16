<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $folder = $request->string('folder', 'inbox')->toString();

        $query = Message::query()
            ->with(['sender:id,name,email,avatar_path', 'recipient:id,name,email,avatar_path'])
            ->when($request->string('search')->toString(), function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('subject', 'like', "%{$search}%")
                        ->orWhere('body', 'like', "%{$search}%");
                });
            });

        if ($folder === 'sent') {
            $query->where('sender_id', $user->id)->where('sender_deleted', false);
        } else {
            $folder = 'inbox';
            $query->where('recipient_id', $user->id)->where('recipient_deleted', false);
        }

        $messages = $query->latest('id')->paginate(15)->withQueryString();

        $messages->getCollection()->transform(function (Message $m) use ($user, $folder) {
            $counterpart = $folder === 'sent' ? $m->recipient : $m->sender;

            return [
                'id' => $m->id,
                'subject' => $m->subject,
                'preview' => str($m->body)->limit(100)->toString(),
                'is_unread' => $folder === 'inbox' && $m->read_at === null,
                'created_at' => $m->created_at?->toIso8601String(),
                'counterpart' => $counterpart ? [
                    'id' => $counterpart->id,
                    'name' => $counterpart->name,
                    'email' => $counterpart->email,
                    'avatar_url' => $counterpart->avatar_url,
                ] : null,
            ];
        });

        return Inertia::render('messages/index', [
            'messages' => $messages,
            'folder' => $folder,
            'filters' => $request->only('search'),
            'stats' => [
                'inbox' => Message::where('recipient_id', $user->id)->where('recipient_deleted', false)->count(),
                'unread' => Message::where('recipient_id', $user->id)->where('recipient_deleted', false)->whereNull('read_at')->count(),
                'sent' => Message::where('sender_id', $user->id)->where('sender_deleted', false)->count(),
            ],
        ]);
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
            'recipient_id' => ['required', 'integer', 'exists:users,id', 'different:user_id'],
            'subject' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:messages,id'],
        ], [
            'required' => ':attribute wajib diisi.',
            'string' => ':attribute harus berupa teks.',
            'max' => ':attribute maksimal :max karakter.',
            'exists' => ':attribute tidak ditemukan.',
            'recipient_id.different' => 'Tidak bisa mengirim pesan ke diri sendiri.',
        ], [
            'recipient_id' => 'Penerima',
            'subject' => 'Subjek',
            'body' => 'Isi pesan',
        ]);

        if ((int) $data['recipient_id'] === $request->user()->id) {
            return back()->withErrors(['recipient_id' => 'Tidak bisa mengirim pesan ke diri sendiri.'])->withInput();
        }

        $message = Message::create([
            ...$data,
            'sender_id' => $request->user()->id,
        ]);

        $recipient = User::find($data['recipient_id']);
        $recipient?->notify(new NewMessageReceived($message));

        return redirect()
            ->route('messages.index', ['folder' => 'sent'])
            ->with('success', 'Pesan terkirim.');
    }

    public function show(Request $request, Message $message): Response
    {
        $user = $request->user();
        abort_unless($message->sender_id === $user->id || $message->recipient_id === $user->id, 403);

        if ($message->recipient_id === $user->id && $message->read_at === null) {
            $message->markAsRead();
        }

        $message->load(['sender:id,name,email,avatar_path', 'recipient:id,name,email,avatar_path']);

        // Build thread: root + all replies in order.
        $rootId = $message->parent_id ?? $message->id;
        $thread = Message::query()
            ->where(function ($q) use ($rootId) {
                $q->where('id', $rootId)->orWhere('parent_id', $rootId);
            })
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)->orWhere('recipient_id', $user->id);
            })
            ->with(['sender:id,name,email,avatar_path'])
            ->orderBy('created_at')
            ->get();

        return Inertia::render('messages/show', [
            'thread' => $thread->map(fn (Message $m) => [
                'id' => $m->id,
                'subject' => $m->subject,
                'body' => $m->body,
                'created_at' => $m->created_at?->toIso8601String(),
                'is_self' => $m->sender_id === $user->id,
                'sender' => $m->sender ? [
                    'id' => $m->sender->id,
                    'name' => $m->sender->name,
                    'email' => $m->sender->email,
                    'avatar_url' => $m->sender->avatar_url,
                ] : null,
            ]),
            'message' => [
                'id' => $message->id,
                'subject' => $message->subject,
            ],
        ]);
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
