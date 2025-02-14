import { FC, useCallback, useState } from 'react';
import { Check, Plus, UserRoundCheck } from 'lucide-react';
import PostsView from '../../../components/PostsView';
import { URL_BASE } from '../../../config';
import { Account } from '../../../types';
import useToast from '../../../hooks/useToast';
import useAuth from '../../../hooks/useAuth';
import { parseAccount } from '../../../types/account';

interface Props {
  userData: Account;
}

const UserPanel: FC<Props> = ({ userData }) => {
  const toast = useToast();
  const { auth } = useAuth();

  const [user, setUser] = useState<Account>(userData);

  const fetchUserData = useCallback(async () => {
    const endpoint = `http://localhost:8080/users/${user.id}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    setUser(parseAccount(data));
  }, [user.id]);

  const handleSendFriendRequest = useCallback(async () => {
    const sendFriendRequest = async () => {
      const endpoint = `${URL_BASE}/requests/friend_requests`;
      try {
        const res = await fetch(endpoint, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ receiver_id: user.id }),
        });
        if (res.ok) {
          fetchUserData();
        } else {
          throw Error('Failed to send friend request');
        }
      } catch (error: any) {
        console.error(error);
      }
    };

    toast.showAsync(sendFriendRequest, {
      loading: {
        title: 'Loading...',
      },
      success: (_: any) => ({
        title: `Friend request sent to ${user.displayName}`,
      }),
      error: (_: any) => ({
        title: 'Something wrong happened',
      }),
    });
  }, [toast, fetchUserData, user.displayName, user.id]);

  const actionButton = (() => {
    switch (user.relationship) {
      case 'Friend':
        return (
          <button className="rounded-full p-2 bg-green-100">
            <UserRoundCheck size={30} className="stroke-green-900" />
          </button>
        );
      case 'Pending':
        return (
          <button className="rounded-full p-2 bg-gray-100 cursor-default">
            <Check size={30} className="stroke-gray-900" />
          </button>
        );
      case 'Stranger':
        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSendFriendRequest();
            }}
            className="rounded-full p-2 bg-blue-100 hover:bg-blue-200"
          >
            <Plus size={30} className="stroke-blue-900" />
          </button>
        );
    }
  })();

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <img
            className="rounded-full flex-[0_0_auto] aspect-square bg-gray-500 size-20"
            src={userData.imgUrl}
            alt="User avatar"
          />
          <div className="flex flex-col justify-center items-start">
            <h1 className="text-3xl font-semibold">{userData.displayName}</h1>
            <p className="text-lg text-muted-foreground">
              @{userData.username}
            </p>
          </div>
        </div>
        {!auth.user?.isAdmin && actionButton}
      </div>
      <PostsView fetchEndpoint={`${URL_BASE}/posts/user/${userData.id}`} />
    </div>
  );
};

export default UserPanel;
