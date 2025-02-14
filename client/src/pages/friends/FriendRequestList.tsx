import { FC } from 'react';
import { FriendRequest } from '../../types';
import AccInfoWithIconButtons from '../../components/AccInfoWithIconButtons';

interface FriendRequestListProps {
  requests: FriendRequest[];
  onAcceptReq: (req: FriendRequest) => void;
  onRejectReq: (req: FriendRequest) => void;
}

const FriendRequestList: FC<FriendRequestListProps> = ({
  requests,
  onAcceptReq,
  onRejectReq,
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-grow overflow-y-auto mt-2 pr-3">
        {requests.map((req) => (
          <AccInfoWithIconButtons
            key={req.id}
            data={req.acc}
            buttons={[
              {
                type: 'accept',
                onClick: () => onAcceptReq(req),
              },
              {
                type: 'reject',
                onClick: () => onRejectReq(req),
              },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export default FriendRequestList;
