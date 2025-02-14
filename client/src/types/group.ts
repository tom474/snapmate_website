import { parseBasicUser, User } from './post';

export type GroupRelationship = 'Stranger' | 'Admin' | 'Member' | 'Pending';

export interface Group {
  id: string;
  name: string;
  description: string;
  visibility: GroupVisibility;
  groupImage?: string;
  coverImage?: string;
  admins: User[];
  members: User[];
  relationship?: GroupRelationship;
}

export enum GroupVisibility {
  PUBLIC,
  PRIVATE,
}

export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected';

export const parseGroup = (data: any): Group => {
  return {
    id: data._id,
    name: data.name,
    description: data.description,
    visibility:
      GroupVisibility[
        (
          data.visibility as string
        ).toUpperCase() as keyof typeof GroupVisibility
      ],
    groupImage: data.virtualGroupImage,
    coverImage: data.virtualCoverImage,
    admins: data.admins,
    members: (data.members as any[]).map((mem) => parseBasicUser(mem)),
    relationship: data.relationship ?? undefined,
  };
};
