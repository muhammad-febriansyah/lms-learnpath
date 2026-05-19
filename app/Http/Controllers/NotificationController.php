<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Notification "type" key buckets used for filtering. Keep in sync
     * with the toDatabase() outputs of the App\Notifications\* classes.
     */
    private const TYPE_BUCKETS = [
        'training' => ['training_assigned', 'training_due_reminder'],
        'message' => ['message'],
        'order' => ['order_paid'],
        'system' => ['info'],
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $bucket = $request->string('bucket')->toString();
        $unreadOnly = $request->boolean('unread_only');

        $query = $user->notifications();

        if ($bucket !== '' && isset(self::TYPE_BUCKETS[$bucket])) {
            $types = self::TYPE_BUCKETS[$bucket];
            $query->whereIn('data->type', $types);
        }

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        $notifications = $query->latest()->paginate(20)->withQueryString();

        $notifications->getCollection()->transform(fn ($n) => [
            'id' => $n->id,
            'type' => $n->data['type'] ?? 'info',
            'title' => $n->data['title'] ?? 'Notifikasi',
            'description' => $n->data['description'] ?? '',
            'href' => $n->data['href'] ?? null,
            'read' => $n->read_at !== null,
            'created_at' => $n->created_at?->toIso8601String(),
        ]);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'filters' => [
                'bucket' => $bucket ?: null,
                'unread_only' => $unreadOnly,
            ],
            'counts' => [
                'all' => $user->notifications()->count(),
                'unread' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        $notification?->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        DatabaseNotification::query()
            ->where('notifiable_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        return back();
    }

    public function destroyRead(Request $request): RedirectResponse
    {
        $count = DatabaseNotification::query()
            ->where('notifiable_id', $request->user()->id)
            ->whereNotNull('read_at')
            ->delete();

        return back()->with('success', "{$count} notifikasi yang sudah dibaca dihapus.");
    }
}
