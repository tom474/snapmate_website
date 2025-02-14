import { FC, useEffect, useState } from 'react';
import Tabs, { Tab } from '../../components/Tabs';
import CompactedGroup from '../../components/CompactedGroup';
import { URL_BASE } from '../../config';
import useAuth from '../../hooks/useAuth';
import { Group, GroupVisibility } from '../../types/group';

const JoinedGroupList = () => {
  const { auth } = useAuth();

  const [joinedGrpList, setJoinedGroups] = useState<Group[]>([]);
  const [moderatingGrpList, setModeratingGroups] = useState<Group[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const endpoint = `${URL_BASE}/users/${auth.user?.userId}/groups`;
        const res = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });

        const data: any[] = await res.json();
        console.log(data);
        const groups = data.map((grp) => {
          return {
            id: grp.id,
            name: grp.name,
            description: grp.description,
            visibility:
              GroupVisibility[
              (
                grp.visibility as string
              ).toUpperCase() as keyof typeof GroupVisibility
              ],
            admins: grp.admins,
            groupImage: grp.virtualGroupImage,
          } as Group;
        });

        const joined = groups.filter((grp) => {
          return !(grp.admins as unknown as string[]).includes(
            auth.user!.userId,
          );
        });
        const moderating = groups.filter((grp) => {
          return (grp.admins as unknown as string[]).includes(
            auth.user!.userId,
          );
        });
        setJoinedGroups(joined);
        setModeratingGroups(moderating);
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, [auth.user]);

  const tabs: Tab[] = [
    {
      name: 'Joined groups',
      element: <GroupsTab groups={joinedGrpList} />,
    },
    {
      name: 'Moderating groups',
      element: <GroupsTab groups={moderatingGrpList} />,
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <Tabs tabs={tabs} />
    </div>
  );
};

const GroupsTab: FC<{ groups: Group[] }> = ({ groups }) => {
  return (
    <div className="flex-grow overflow-y-auto mt-6 pr-3">
      {groups.length > 0 ? (
        groups.map((grp) => {
          return <CompactedGroup key={grp.id} data={grp} />;
        })
      ) : (
        <p>You have yet joined a group</p>
      )}
    </div>
  );
};

export default JoinedGroupList;
