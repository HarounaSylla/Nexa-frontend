import { Bell } from "lucide-react";

import {
  NOTIFICATION_LIST_CLASS,
  NotificationRow,
} from "@/components/notifications/notification-row";
import { notificationHref } from "@/components/notifications/notification-copy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { NotificationItem } from "@/lib/notifications-api";

export function NotificationsCard({
  items,
  unread,
  pending,
  onMarkAllRead,
  onMarkRead,
}: {
  items: NotificationItem[];
  unread: number;
  pending: boolean;
  onMarkAllRead: () => void;
  onMarkRead: (item: NotificationItem) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-section-title">Notifications</h2>
        {unread > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={onMarkAllRead}
          >
            Tout marquer comme lu
          </Button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-5" aria-hidden="true" />}
          title="Aucune notification pour le moment"
          description="Les alertes de commandes, conversations et stock apparaîtront ici."
        />
      ) : (
        <Card flush className="overflow-hidden">
          <ul className={NOTIFICATION_LIST_CLASS}>
            {items.map((item) => (
              <li key={item.id}>
                <NotificationRow
                  item={item}
                  href={notificationHref(item)}
                  onClick={() => {
                    if (item.read_at == null) {
                      onMarkRead(item);
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
