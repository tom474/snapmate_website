import { FC, useCallback, useState, useEffect, useMemo } from 'react';
import Tabs, { Tab } from '../../components/Tabs';
import Layout from '../../components/Layout';
import FriendList from './FriendList';
import FriendRequestList from './FriendRequestList';
import FriendSuggestionList from './FriendSuggestionList';
import { Account, FriendRequest } from '../../types';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { URL_BASE } from '../../config';
import { parseAccount } from '../../types/account';

const FriendsPage: FC = () => {
  const { auth } = useAuth();
  const toast = useToast();

  const [friends, setFriends] = useState<Account[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Account[]>([]);

  const fetchFriendList = useCallback(async () => {
    if (!auth.user) return;
    const endpoint = `${URL_BASE}/users/${auth.user.userId}/friends`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await res.json();
    setFriends(
      result.map(
        (acc: any) =>
          ({
            id: acc._id,
            username: acc.username,
            displayName: acc.displayName,
            imgUrl: acc.virtualProfileImage ?? '',
          }) satisfies Account,
      ),
    );
  }, [auth.user]);

  const fetchFriendRequests = useCallback(async () => {
    const endpoint = `${URL_BASE}/requests/friend_requests/`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    const result: any[] = await res.json();
    const requests = await Promise.all(
      result.map(async (req) => {
        const getUserEndpoint = `${URL_BASE}/users/${req.sender_id}`;
        const userRes = await fetch(getUserEndpoint, {
          method: 'GET',
          credentials: 'include',
        });
        const data: any = await userRes.json();

        // Assuming the API returns a single user object, not an array
        return {
          id: req._id,
          acc: {
            id: data._id,
            username: data.username,
            displayName: data.displayName,
            imgUrl: data.virtualProfileImage ?? '',
          },
        } as FriendRequest;
      }),
    );

    setFriendRequests(requests);
  }, []);

  const fetchFriendSuggestions = useCallback(async () => {
    if (!auth.user) return;
    const endpoint = `${URL_BASE}/users/${auth.user.userId}/friends/recommend`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await res.json();
    setSuggestions(result.map((acc: any) => parseAccount(acc)));
  }, [auth.user]);

  const handleRemoveFriend = useCallback(
    async (user: Account) => {
      if (!auth.user) return;
      const removeFriend = async () => {
        const endpoint = `${URL_BASE}/users/unfriend/${user.id}`;

        const res = await fetch(endpoint, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) {
          fetchFriendList();
        } else {
          throw Error('Failed to remove friend');
        }
      };

      toast.showAsync(removeFriend, {
        loading: {
          title: 'Loading...',
        },
        success: (_) => ({
          title: `Removed ${user.displayName} from your friend list`,
        }),
        error: (_) => ({
          title: 'Something wrong happened',
        }),
      });
    },
    [auth.user, fetchFriendList, toast],
  );

  const handleAccReq = useCallback(
    async (req: FriendRequest) => {
      const removeFriend = async () => {
        const endpoint = `${URL_BASE}/requests/friend_requests/accept/${req.id}`;

        const res = await fetch(endpoint, {
          method: 'PATCH',
          credentials: 'include',
        });
        if (res.ok) {
          fetchFriendRequests();
          fetchFriendList();
        } else {
          throw Error('Failed to accept friend request');
        }
      };

      toast.showAsync(removeFriend, {
        loading: {
          title: 'Loading...',
        },
        success: (_) => ({
          title: `Accepted friend request from ${req.acc.displayName}`,
        }),
        error: (_) => ({
          title: 'Something wrong happened',
        }),
      });
    },
    [fetchFriendRequests, fetchFriendList, toast],
  );

  const handleRejectReq = useCallback(
    async (req: FriendRequest) => {
      const removeFriend = async () => {
        const endpoint = `${URL_BASE}/requests/friend_requests/reject/${req.id}`;

        const res = await fetch(endpoint, {
          method: 'PATCH',
          credentials: 'include',
        });
        if (res.ok) {
          fetchFriendRequests();
          fetchFriendList();
        } else {
          throw Error('Failed to reject friend request');
        }
      };

      toast.showAsync(removeFriend, {
        loading: {
          title: 'Loading...',
        },
        success: (_) => ({
          title: `Rejected friend request from ${req.acc.displayName}`,
        }),
        error: (_) => ({
          title: 'Something wrong happened',
        }),
      });
    },
    [fetchFriendRequests, fetchFriendList, toast],
  );

  const tabs: Tab[] = useMemo(
    () => [
      {
        name: 'My friends',
        element: (
          <FriendList friends={friends} onRemoveFriend={handleRemoveFriend} />
        ),
      },
      {
        name: 'Requests',
        element: (
          <FriendRequestList
            requests={friendRequests}
            onAcceptReq={handleAccReq}
            onRejectReq={handleRejectReq}
          />
        ),
      },
      {
        name: 'Suggestions',
        element: <FriendSuggestionList suggestions={suggestions} />,
      },
    ],
    [
      friends,
      handleRemoveFriend,
      friendRequests,
      handleAccReq,
      handleRejectReq,
      suggestions,
    ],
  );

  useEffect(() => {
    fetchFriendList();
  }, [fetchFriendList]);

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  useEffect(() => {
    fetchFriendSuggestions();
  }, [fetchFriendSuggestions]);

  return (
    <Layout mainClassName="overflow-y-hidden">
      <Tabs tabs={tabs} />
    </Layout>
  );
};

export default FriendsPage;
