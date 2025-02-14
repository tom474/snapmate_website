import { useLoaderData, useParams } from 'react-router';
import PostCreationPanel from '../../../components/PostCreationPanel';
import { mergeClassNames } from '../../../utils';
import PostsView, { PostsViewRef } from '../../../components/PostsView';
import { Group, GroupVisibility } from '../../../types/group';
import { FC, useRef } from 'react';
import useAuth from '../../../hooks/useAuth';
import { URL_BASE } from '../../../config';
import useToast from '../../../hooks/useToast';

const GroupPanel = () => {
  const groupData = useLoaderData() as Group;
  const { auth } = useAuth();

  const params = useParams();
  const groupId = params.groupId;

  const postViewRef = useRef<PostsViewRef>(null);

  // Find if current user has joined the group
  const thisUserInGroup = groupData.members.filter(
    (mem) => mem.id === auth.user?.userId,
  );

  const canView = (): boolean => {
    if (auth.user?.isAdmin) {
      return true;
    }
    if (groupData.visibility === GroupVisibility.PRIVATE) {
      // Length = 0 means user is not in group
      if (thisUserInGroup.length === 0) return false;
    }
    return true;
  };

  const joinGroup = async () => {
    try {
      const endpoint = `${URL_BASE}/requests/group_requests`;
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: groupId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        throw Error;
      }
    } catch (error) { }
  };

  return (
    <div className="flex flex-col gap-4">
      <GroupHeader
        coverImg={groupData.coverImage}
        avatarImg={groupData.groupImage}
        name={groupData.name}
        onJoin={joinGroup}
        isJoined={
          groupData.members.filter((mem) => mem.id === auth.user!.userId)
            .length > 0
        }
      />
      {canView() ? (
        <>
          {thisUserInGroup.length === 0 ? null : (
            <PostCreationPanel
              onPostUpload={() => {
                postViewRef.current?.reset();
                postViewRef.current?.fetchPosts();
              }}
            />
          )}
          <PostsView
            ref={postViewRef}
            fetchEndpoint={`${URL_BASE}/posts/group/${groupData.id}`}
          />
        </>
      ) : (
        <div className="size-full flex flex-col gap-6 items-center justify-center">
          <h1 className="text-9xl font-bold">Oops</h1>
          <p className="text-xl flex flex-col items-center gap-2 text-center">
            <span>
              It would seem the knowledge of this group surpasseth thy wisdom.
            </span>
            <span>
              If thou desirest to learn more of the group, then join and be one
              with us.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

interface GroupHeaderProps {
  coverImg?: string;
  avatarImg?: string;
  onJoin: () => Promise<any>;
  name: string;
  isJoined: boolean;
}

const GroupHeader: FC<GroupHeaderProps> = ({
  coverImg,
  avatarImg,
  onJoin,
  name,
  isJoined,
}) => {
  const toast = useToast();
  const { auth } = useAuth();

  return (
    <div className="w-full">
      <img
        className="w-full bg-gray-500 object-cover rounded-lg h-40"
        src={coverImg}
        alt="group cover"
      />
      <div className="relative flex gap-2 p-2">
        {/* Avatar img container */}
        <div className="h-0 min-w-fit">
          <img
            className={mergeClassNames(
              'bg-gray-500 object-cover',
              'relative aspect-square rounded-full size-24 -translate-y-1/2',
              'border-background border-solid border-4',
            )}
            src={avatarImg}
            alt="group avatar"
          />
        </div>
        {/* Group info */}
        <div className="flex gap-2 w-full items-center">
          <h1 className="font-bold text-2xl">g/{name}</h1>
          {isJoined && !auth.user?.isAdmin && (
            <div className="px-4 py-2 ml-auto border-border border-solid border-2 rounded-lg bg-background">
              Joined
            </div>
          )}
          {!auth.user?.isAdmin && !isJoined && (
            <button
              onClick={(_) => {
                toast.showAsync(onJoin, {
                  loading: {
                    title: 'Sending request...',
                  },
                  success: (_) => ({
                    title: 'Request sent',
                  }),
                  error: (_) => ({
                    title: 'Could not send request',
                  }),
                });
              }}
              className="px-4 py-2 transition-colors rounded-lg bg-primary hover:bg-secondary ml-auto"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPanel;
