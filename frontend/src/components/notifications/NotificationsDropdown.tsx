'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Bell, CheckCheck } from 'lucide-react';
import {
  NOTIFICATIONS,
  UNREAD_NOTIFICATIONS_COUNT,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  AppNotification,
} from '@/lib/graphql/operations';
import { formatDateTime } from '@/lib/format';

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);

  const { data: countData } = useQuery<{ unreadNotificationsCount: number }>(
    UNREAD_NOTIFICATIONS_COUNT,
    { pollInterval: 30000 }
  );
  const { data: notifData } = useQuery<{ notifications: AppNotification[] }>(NOTIFICATIONS, {
    variables: { limit: 20 },
    skip: !open,
  });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: ['UnreadNotificationsCount', 'Notifications'],
  });
  const [markAll] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: ['UnreadNotificationsCount', 'Notifications'],
  });

  const unread = countData?.unreadNotificationsCount ?? 0;
  const notifications = notifData?.notifications ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <span className="text-sm font-semibold text-ink-900">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={() => markAll()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-400">No notifications yet.</p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => markRead({ variables: { id: n.id } })}
                        className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-ink-50 ${
                          n.read ? 'opacity-60' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink-700">{n.title}</span>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                        </span>
                        <span className="text-xs text-ink-500">{n.message}</span>
                        <span className="text-[10px] text-ink-400">{formatDateTime(n.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
