import { FC, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { URL_BASE } from '../../config';
import Tabs, { Tab } from '../../components/Tabs';
import SearchBar from '../../components/ui/SearchBar';
import AccInfoWithIconButtons from '../../components/AccInfoWithIconButtons';
import CompactedGroup from '../../components/CompactedGroup';
import { Account } from '../../types';
import { parseAccount } from '../../types/account';
import { Group, parseGroup } from '../../types/group';
import useToast from '../../hooks/useToast';

const Search: FC = () => {
  const toast = useToast();

  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<Account[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const searchUsers = useCallback(async (searchText: string) => {
    const endpoint = new URL(`${URL_BASE}/users`);
    endpoint.searchParams.append('name', searchText);

    const res = await fetch(endpoint.toString(), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const result: any[] = await res.json();
    setUsers(result.map((item) => parseAccount(item)));
  }, []);

  const searchGroups = useCallback(async (searchText: string) => {
    const endpoint = new URL(`${URL_BASE}/groups`);
    endpoint.searchParams.append('name', searchText);

    const res = await fetch(endpoint.toString(), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const result: any[] = await res.json();
    setGroups(result.map((item) => parseGroup(item)));
  }, []);

  const handleSendFriendRequest = useCallback(
    async (user: Account) => {
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
            searchUsers(searchValue);
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
    [toast, searchUsers, searchValue],
  );

  const handleSendGroupRequest = useCallback(
    async (group: Group) => {
      const sendFriendRequest = async () => {
        const endpoint = `${URL_BASE}/requests/group_requests`;
        try {
          const res = await fetch(endpoint, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ group_id: group.id }),
          });
          if (res.ok) {
            searchGroups(searchValue);
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
          title: `Group request sent to ${group.name}`,
        }),
        error: (_: any) => ({
          title: 'Something wrong happened',
        }),
      });
    },
    [toast, searchGroups, searchValue],
  );

  const onSearch = useCallback(async () => {
    setMessage(`Search results for "${searchValue}"`);
    await Promise.all([searchUsers(searchValue), searchGroups(searchValue)]);
  }, [searchUsers, searchGroups, searchValue]);

  const tabs: Tab[] = [
    {
      name: 'Users',
      element: (
        <div>
          {users.map((acc) => {
            return (
              <AccInfoWithIconButtons
                key={acc.id}
                data={acc}
                buttons={[
                  {
                    type:
                      acc.relationship === 'Friend'
                        ? 'alreadyFriend'
                        : acc.relationship === 'Pending'
                          ? 'requestSent'
                          : 'add',
                    onClick:
                      acc.relationship === 'Stranger'
                        ? () => handleSendFriendRequest(acc)
                        : undefined,
                  },
                ]}
              />
            );
          })}
        </div>
      ),
    },
    {
      name: 'Groups',
      element: (
        <div>
          {groups.map((group) => (
            <CompactedGroup
              data={group}
              button={{
                type:
                  group.relationship === 'Stranger'
                    ? 'toRequest'
                    : group.relationship === 'Pending'
                      ? 'requestSent'
                      : 'member',
                onClick:
                  group.relationship === 'Stranger'
                    ? () => handleSendGroupRequest(group)
                    : undefined,
              }}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <SearchBar
        value={searchValue}
        onChange={(value) => {
          setUsers([]);
          setGroups([]);
          setMessage('');
          setSearchValue(value);
        }}
        onSearch={onSearch}
        className={!message ? 'mb-4' : ''}
      />
      {message && <p className="text-sm mt-2 mb-2 text-gray-400">{message}</p>}
      <Tabs tabs={tabs} />
    </Layout>
  );
};

export default Search;
