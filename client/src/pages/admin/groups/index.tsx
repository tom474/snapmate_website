import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../../components/Layout';
import Tabs, { Tab } from '../../../components/Tabs';
import { URL_BASE } from '../../../config';
import { Group, parseGroup } from '../../../types/group';
import CompactedGroup from '../../../components/CompactedGroup';
import {
  parseGroupCreationRequest,
  GroupCreationRequest,
} from '../../../types/groupCreationRequest';
import GroupRequestList from './GroupRequestList';
import useToast from '../../../hooks/useToast';

const AdminGroupsPage: FC = () => {
  const toast = useToast();

  const [groups, getGroups] = useState<Group[]>([]);
  const [groupRequests, setGroupRequests] = useState<GroupCreationRequest[]>(
    [],
  );

  const fetchAllGroups = useCallback(async () => {
    const endpoint = `${URL_BASE}/groups`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });

    const data: any[] = await res.json();
    const groups = data.map((grp) => parseGroup(grp));
    getGroups(groups);
  }, []);

  const fetchAllGroupRequests = useCallback(async () => {
    const endpoint = `${URL_BASE}/requests/group_creation_requests`;
    const res = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    const data: any[] = await res.json();
    setGroupRequests(data.map((req) => parseGroupCreationRequest(req)));
  }, []);

  const handleAcceptReq = useCallback(
    async (req: GroupCreationRequest) => {
      const acceptReq = async () => {
        const endpoint = `${URL_BASE}/requests/group_creation_requests/accept/${req.id}`;
        const res = await fetch(endpoint, {
          method: 'PATCH',
          credentials: 'include',
        });
        if (res.ok) {
          fetchAllGroupRequests();
          fetchAllGroups();
        } else {
          throw new Error('Failed to accept group creation request');
        }
      };

      toast.showAsync(acceptReq, {
        loading: {
          title: 'Loading...',
        },
        success: (_) => ({
          title: `Group creation request for ${req.group.name} accepted`,
        }),
        error: (_) => ({
          title: 'Failed to accept group creation request',
        }),
      });
    },
    [fetchAllGroups, fetchAllGroupRequests, toast],
  );

  const handleRejectReq = useCallback(
    async (req: GroupCreationRequest) => {
      const rejectReq = async () => {
        const endpoint = `${URL_BASE}/requests/group_creation_requests/reject/${req.id}`;
        const res = await fetch(endpoint, {
          method: 'PATCH',
          credentials: 'include',
        });
        if (res.ok) {
          fetchAllGroupRequests();
          fetchAllGroups();
        } else {
          throw new Error('Failed to reject group creation request');
        }
      };

      toast.showAsync(rejectReq, {
        loading: {
          title: 'Loading...',
        },
        success: (_) => ({
          title: `Group creation request for ${req.group.name} rejected`,
        }),
        error: (_) => ({
          title: 'Failed to reject group creation request',
        }),
      });
    },
    [fetchAllGroups, fetchAllGroupRequests, toast],
  );

  const tabs: Tab[] = useMemo(
    () => [
      {
        name: 'All Groups',
        element: (
          <div className="mt-2 flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-[1] overflow-y-auto pr-3">
              {groups.map((group) => {
                return <CompactedGroup key={group.id} data={group} />;
              })}
            </div>
          </div>
        ),
      },
      {
        name: 'Group Requests',
        element: (
          <GroupRequestList
            requests={groupRequests}
            onAcceptRequest={handleAcceptReq}
            onRejectRequest={handleRejectReq}
          />
        ),
      },
    ],
    [groupRequests, groups, handleAcceptReq, handleRejectReq],
  );

  useEffect(() => {
    fetchAllGroups();
  }, [fetchAllGroups]);

  useEffect(() => {
    fetchAllGroupRequests();
  }, [fetchAllGroupRequests]);

  return (
    <Layout mainClassName="overflow-y-hidden">
      <Tabs tabs={tabs} />
    </Layout>
  );
};

export default AdminGroupsPage;
