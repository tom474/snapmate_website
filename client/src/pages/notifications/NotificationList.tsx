import { MessageCircle, User, Users, SmilePlus, SquarePen } from 'lucide-react';
import { FC, useState, useEffect } from 'react';
import { Notification } from '../../types';
import { formatRelativeTime } from '../../utils';
import useAuth from '../../hooks/useAuth';
import { URL_BASE } from '../../config';

const NotificationList: FC = () => {
  const { auth } = useAuth();

  const [notificationList, setNotificationList] = useState<Notification[]>([]);

  const sortedList = notificationList.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!auth.user) return;
      const endpoint = `${URL_BASE}/users/${auth.user.userId}/notifications`;
      const res = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await res.json();
      setNotificationList(result);
    };

    fetchNotifications();
  }, [auth.user]);

  useEffect(() => {
    if (notificationList.length === 0) return;

    const markReadNotifications = async () => {
      const endpoints = notificationList
        .filter((item) => !item.isRead)
        .map((item) => `${URL_BASE}/users/notifications/${item.id}`);

      await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint, {
            method: 'PATCH',
            credentials: 'include',
          }),
        ),
      );
    };

    markReadNotifications();
  }, [notificationList]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <h2 className="font-bold text-3xl pb-3 border-b-2 border-border">
        Notifications
      </h2>
      <div className="flex-grow overflow-y-auto mt-4 pr-3">
        {sortedList.map((item) => (
          <NotificationItem key={item.id} data={item} onRead={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default NotificationList;

interface NotificationItemProps {
  data: Notification;
  onRead: () => void;
}

const NotificationItem: FC<NotificationItemProps> = ({
  data: { message, isRead, type, createdAt },
}) => {
  const Icon = (() => {
    switch (type) {
      case 'User':
        return User;
      case 'Comment':
        return SquarePen;
      case 'Group':
        return Users;
      case 'Post':
        return MessageCircle;
      case 'Reaction':
        return SmilePlus;
    }
  })();

  const iconClassName = (() => {
    switch (type) {
      case 'User':
        return 'stroke-green-300';
      case 'Comment':
        return 'stroke-blue-300';
      case 'Group':
        return 'stroke-yellow-300';
      case 'Post':
        return 'stroke-orange-300';
      case 'Reaction':
        return 'stroke-rose-300';
    }
  })();

  return (
    <div className="px-2 flex items-center justify-between gap-4 border-b-2 border-border py-4 hover:bg-slate-900">
      <div className="flex items-center gap-4">
        <div>
          <Icon size={28} className={iconClassName} />
        </div>
        <p className="line-clamp-2">
          {message}
          <span className="text-slate-400 text-sm ml-2">
            {formatRelativeTime(new Date(createdAt))}
          </span>
        </p>
      </div>
      {!isRead && (
        <span className="relative flex size-2 mr-2">
          <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full size-2 bg-red-400"></span>
        </span>
      )}
    </div>
  );
};
