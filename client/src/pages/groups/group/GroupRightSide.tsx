import { Check, Globe, Lock, Mail, Trash, UserRound } from 'lucide-react';
import { mergeClassNames } from '../../../utils';
import PopupModal from '../../../components/PopupModal';
import { FC, useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { Group, GroupVisibility } from '../../../types/group';
import { parseBasicUser, User } from '../../../types/post';
import { URL_BASE } from '../../../config';
import { AuthorPfp, FallBackPfp } from '../../../components/Post';
import useAuth from '../../../hooks/useAuth';
import Loading from '../../../components/ui/Loading';
import useToast from '../../../hooks/useToast';
import {
  GroupJoinRequest,
  parseGroupJoinReq,
} from '../../../types/groupJoinRequest';
import Tabs, { Tab } from '../../../components/Tabs';

const GroupRightSide = () => {
  const groupData = useLoaderData() as Group;
  const { auth } = useAuth();

  const [admins, setAdmins] = useState<User[]>([]);

  const isGroupAdmin = (() => {
    for (let admin of admins) {
      if (admin.id === auth.user!.userId) {
        return true;
      }
    }
    return false;
  })();

  useEffect(() => {
    const fetchAdmins = async () => {
      const endpoint = `${URL_BASE}/groups/${groupData.id}/admins`;
      const res = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      const data: any[] = await res.json();
      const adminsData = data.map((user) => {
        return parseBasicUser(user);
      });
      setAdmins(adminsData);
    };

    fetchAdmins();
  }, [groupData.id]);

  const showPopup = (tab: number) => {
    return <Popup initialTab={tab} isGroupAdmin={isGroupAdmin} />;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={mergeClassNames('block-container flex-col')}>
        {/* Group Description */}
        <div className="flex flex-col">
          <h1 className="font-bold text-lg">{groupData.name}</h1>
          <p>
            {groupData.description
              ? groupData.description
              : 'No description was provided'}
          </p>
        </div>
        {/* Visibility */}
        <p className="flex gap-2 items-center justify-center font-semibold rounded-lg bg-secondary py-2">
          {groupData.visibility === GroupVisibility.PUBLIC ? (
            <>
              <Globe size={24} /> Public group
            </>
          ) : (
            <>
              <Lock size={24} /> Private
            </>
          )}
        </p>
        {/* Members */}
        <div className="flex gap-2">
          <div className="flex flex-col w-full">
            <h2 className="font-bold">{groupData.members.length}</h2>
            <p className="text-muted">Members</p>
          </div>
          <div className="flex flex-col w-full">
            <h2 className="font-bold">{groupData.admins.length}</h2>
            <p className="text-muted flex gap-2 items-center">Moderators</p>
          </div>
        </div>
      </div>
      {/* Current role */}
      <div className="block-container flex-col">
        <h1 className="text-2xl font-bold">Moderators</h1>
        {/* Display only 3 moderators max */}
        {admins.length > 0 ? (
          <>
            {admins.slice(0, 3).map((admin) => (
              <AuthorPfp
                currentUser={auth.user!.userId == admin.id}
                key={admin.id}
                data={admin}
              />
            ))}
          </>
        ) : (
          <FallBackPfp />
        )}
      </div>
      {/* Actions */}
      <div className="block-container flex-col">
        <PopupModal
          heightPercent={0.8}
          className="w-full"
          expand
          modelRender={showPopup(0)}
        >
          <button className="flex gap-2 w-full items-center justify-center font-semibold rounded-lg bg-primary text-foreground py-2">
            <UserRound size={24} /> People
          </button>
        </PopupModal>
        {isGroupAdmin && (
          <PopupModal
            heightPercent={0.8}
            expand
            className="w-full"
            modelRender={showPopup(1)}
          >
            <button className="flex gap-2 w-full items-center justify-center font-semibold rounded-lg bg-primary text-foreground py-2">
              <Mail size={24} /> Requests
            </button>
          </PopupModal>
        )}
      </div>
    </div>
  );
};

const Popup: FC<{ initialTab?: number; isGroupAdmin?: boolean }> = ({
  initialTab = 0,
  isGroupAdmin = false,
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(initialTab);

  const requireAdminAccess: boolean[] = [false, true];

  const tabs: Tab[] = [
    {
      name: 'People',
      element: <ViewAllPeople />,
    },
    ...(isGroupAdmin
      ? [
        {
          name: 'Join requests',
          element: <ViewRequests />,
        },
      ]
      : []),
  ];

  if (requireAdminAccess[selectedTab] && !isGroupAdmin) {
    setSelectedTab(0);
  }

  return (
    <div className="block-container flex-col size-full">
      <Tabs defaultTab={initialTab} tabs={tabs} />
    </div>
  );
};

const ViewAllPeople = () => {
  const groupData = useLoaderData() as Group;
  const toast = useToast();

  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(true);

  const navigate = useNavigate();

  const adminIds: string[] = groupData.admins.map(
    (admin) => parseBasicUser(admin).id,
  );

  const { auth } = useAuth();

  const removeMember = async (memberId: string) => {
    const removeRequest = async () => {
      try {
        const endpoint = `${URL_BASE}/groups/${groupData.id}/members/${memberId}`;
        const res = await fetch(endpoint, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (res.ok) {
          setMembers((members) =>
            members.filter((member) => member.id !== memberId),
          );
        } else {
          throw Error;
        }
      } catch (error) { }
    };

    toast.showAsync(removeRequest, {
      loading: {
        title: 'Removing...',
      },
      success: (_) => ({
        title: 'Member removed successfully',
      }),
      error: (_) => ({
        title: 'Couldnt remove member, please try again',
      }),
    });
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const endpoint = `${URL_BASE}/groups/${groupData.id}/members`;
      const res = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      const data: any[] = await res.json();
      const membersData = data.map((user) => {
        return parseBasicUser(user);
      });
      setMembers(membersData);
      setIsloading(false);
    };

    fetchMembers();
  }, []);

  return (
    <div className="flex flex-col gap-4 justify-start items-center size-full">
      {isLoading && <Loading />}
      {!isLoading && (
        <>
          {members.length > 0 ? (
            <>
              {members.map((member) => {
                return (
                  <div
                    onClick={(e) => {
                      navigate(`/users/${member.id}`);
                    }}
                    key={member.id}
                    className="block-container w-full items-center cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <AuthorPfp data={member} />
                    {adminIds.includes(member.id) && (
                      <p className="text-xl ml-auto font-bold">Moderator</p>
                    )}
                    {adminIds.includes(auth.user?.userId || '') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeMember(member.id);
                        }}
                        className="flex ml-auto items-center justify-center font-semibold rounded-lg bg-danger hover:bg-secondary transition-colors text-foreground py-2 px-4"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex justify-center items-center size-full">
              No members here
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ViewRequests = () => {
  const groupData = useLoaderData() as Group;
  const toast = useToast();

  const [reqs, setReqs] = useState<GroupJoinRequest[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const acceptJoinGroup = async (reqId: string) => {
    const acceptRequest = async () => {
      try {
        const endpoint = `${URL_BASE}/requests/group_requests/accept/${reqId}`;
        const res = await fetch(endpoint, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (res.ok) {
          setReqs((req) => req.filter((req) => req.id !== reqId));
        } else {
          throw Error;
        }
      } catch (error) { }
    };

    toast.showAsync(acceptRequest, {
      loading: {
        title: 'Accepting...',
      },
      success: (_) => ({
        title: 'Accepted a new member',
      }),
      error: (_) => ({
        title: 'Could not accept member, please try again',
      }),
    });
  };

  const rejectJoinGroup = async (reqId: string) => {
    const rejectRequest = async () => {
      try {
        const endpoint = `${URL_BASE}/requests/group_requests/reject/${reqId}`;
        const res = await fetch(endpoint, {
          method: 'PATCH',
          credentials: 'include',
        });

        if (res.ok) {
          setReqs((req) => req.filter((req) => req.id !== reqId));
        } else {
          throw Error;
        }
      } catch (error) { }
    };

    toast.showAsync(rejectRequest, {
      loading: {
        title: 'Rejecting...',
      },
      success: (_) => ({
        title: 'Successfully removed a member',
      }),
      error: (_) => ({
        title: 'Could not reject member, please try again',
      }),
    });
  };

  useEffect(() => {
    const fetchReqs = async () => {
      const endpoint = `${URL_BASE}/groups/${groupData.id}/requests`;
      const res = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      const data: any[] = await res.json();
      const reqs = data.map((req) => {
        return parseGroupJoinReq(req);
      });

      if (res.ok) {
        setReqs(reqs);
        setLoading(false);
      }
    };

    fetchReqs();
  }, []);

  return (
    <div className="flex flex-col gap-4 justify-start items-center size-full">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {reqs.length > 0 ? (
            <>
              {reqs.map((req) => {
                return (
                  <div
                    key={req.id}
                    className="block-container w-full items-center"
                  >
                    <AuthorPfp data={req.user} />
                    <div className="flex gap-2 h-full ml-auto">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          acceptJoinGroup(req.id);
                        }}
                        className="flex justify-center transition-colors hover:bg-secondary items-center gap-2 py-2 px-4 bg-success rounded-lg"
                      >
                        <Check />
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          rejectJoinGroup(req.id);
                        }}
                        className="flex justify-center transition-colors hover:bg-secondary items-center gap-2 py-2 px-4 bg-danger rounded-lg"
                      >
                        <Trash />
                        Deny
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p>Look like peace for now</p>
          )}
        </>
      )}
    </div>
  );
};

export default GroupRightSide;
