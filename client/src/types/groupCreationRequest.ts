import { Group, RequestStatus, GroupVisibility } from './group';

export interface GroupCreationRequest {
  id: string;
  userId: string;
  status: RequestStatus;
  group: Omit<Group, 'id' | 'admins' | 'members'>;
}

export const parseGroupCreationRequest = (data: any): GroupCreationRequest => {
  const { _id: id, user_id: userId, status, group } = data;
  return {
    id,
    userId,
    status,
    group: {
      name: group.name,
      description: group.description,
      visibility:
        GroupVisibility[
          (
            group.visibility as string
          ).toUpperCase() as keyof typeof GroupVisibility
        ],
      groupImage: group.virtualGroupImage,
      coverImage: group.virtualCoverImage,
    },
  };
};
