import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Account } from '../../types';
import { URL_BASE } from '../../config';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import AccInfoWithIconButtons from '../../components/AccInfoWithIconButtons';

interface FriendSuggestionListProps {
  suggestions: Account[];
}

const FriendSuggestionList: FC<FriendSuggestionListProps> = ({
  suggestions,
}) => {
  const { auth } = useAuth();
  const toast = useToast();

  const [requestReceiverList, setRequestReceiverList] = useState<string[]>([]);

  const fetchRequestSentList = useCallback(async () => {
    if (!auth.user) return;
    const endpoint = `${URL_BASE}/users/${auth.user.userId}/friend-requests`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    const result = await res.json();
    setRequestReceiverList(result.map((req: any) => req.receiver_id));
  }, [auth.user]);

  const handleSendFriendRequest = useCallback(
    async (user: Account) => {
      if (!auth.user) return;
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
            fetchRequestSentList();
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
    },
    [auth.user, fetchRequestSentList, toast],
  );

  const list = useMemo(
    () =>
      suggestions.map((acc) => {
        const alreadySentRequest = requestReceiverList.includes(acc.id);
        return (
          <AccInfoWithIconButtons
            key={acc.id}
            data={acc}
            buttons={[
              {
                type: alreadySentRequest ? 'requestSent' : 'add',
                onClick: alreadySentRequest
                  ? undefined
                  : () => handleSendFriendRequest(acc),
              },
            ]}
          />
        );
      }),
    [requestReceiverList, handleSendFriendRequest, suggestions],
  );

  useEffect(() => {
    fetchRequestSentList();
  }, [fetchRequestSentList]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-grow overflow-y-auto mt-2 pr-3">{list}</div>
    </div>
  );
};

export default FriendSuggestionList;
