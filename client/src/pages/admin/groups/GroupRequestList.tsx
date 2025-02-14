import { Check, Globe, Lock, X } from 'lucide-react';
import { FC } from 'react';
import { GroupVisibility } from '../../../types/group';
import { GroupCreationRequest } from '../../../types/groupCreationRequest';

interface GroupRequestListProps {
  requests: GroupCreationRequest[];
  onAcceptRequest: (req: GroupCreationRequest) => void;
  onRejectRequest: (req: GroupCreationRequest) => void;
}

const GroupRequestList: FC<GroupRequestListProps> = ({
  requests,
  onAcceptRequest,
  onRejectRequest,
}) => {
  return (
    <div className="mt-2 flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-grow overflow-y-auto pr-3">
        {requests.map((req) => (
          <GroupRequestItem
            key={req.id}
            data={req}
            onAccept={() => onAcceptRequest(req)}
            onReject={() => onRejectRequest(req)}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupRequestList;

interface GroupRequestItemProps {
  data: GroupCreationRequest;
  onAccept: () => void;
  onReject: () => void;
}

const GroupRequestItem: FC<GroupRequestItemProps> = ({
  data: { id, group },
  onAccept,
  onReject,
}) => {
  const { groupImage, visibility, name } = group;

  return (
    <div className="flex items-center justify-between px-2 py-3 rounded-md hover:bg-secondary/50">
      <div className="flex items-center gap-2 w-full">
        <img
          src={groupImage}
          className="rounded-full bg-gray-500 size-12"
          alt="group"
        />
        <div>
          <div className="flex items-center gap-1">
            <p className="text-base">{name}</p>
            <div>
              {visibility === GroupVisibility.PUBLIC ? (
                <Globe size={14} className="stroke-gray-500" />
              ) : (
                <Lock size={14} className="stroke-gray-500" />
              )}
            </div>
          </div>
          <p className="text-sm w-24 text-gray-500 truncate">@{id}</p>
        </div>
      </div>
      <div className="flex gap-1.5 items-center">
        <button
          onClick={onAccept}
          className="rounded-full p-1.5 bg-green-100 hover:bg-green-200"
        >
          <Check size={16} className="stroke-green-900" />
        </button>
        <button
          onClick={onReject}
          className="rounded-full p-1.5 bg-red-100 hover:bg-red-200"
        >
          <X size={16} className="stroke-red-900" />
        </button>
      </div>
    </div>
  );
};
