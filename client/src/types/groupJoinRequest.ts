import { RequestStatus } from './group';
import { parseBasicUser, User } from './post';

export interface GroupJoinRequest {
  id: string;
  user: User;
  requestedDate: Date;
  status: RequestStatus;
}

export const parseGroupJoinReq = (data: any) => {
  return {
    id: data.id,
    user: parseBasicUser(data.user),
    requestedDate: new Date(data.createdAt),
    status: data.status,
  } as GroupJoinRequest;
};
