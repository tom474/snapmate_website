import { FC } from 'react';
import { Account } from '../../types';
import AccInfoWithTextBtn from '../../components/AccInfoWithTextBtn';

interface FriendListProps {
  friends: Account[];
  onRemoveFriend: (friend: Account) => void;
}

const FriendList: FC<FriendListProps> = ({ friends, onRemoveFriend }) => {
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-grow overflow-y-auto mt-2 pr-3">
        {friends.map((acc) => (
          <AccInfoWithTextBtn
            key={acc.id}
            data={acc}
            button={{
              text: 'Remove',
              actionFn: () => onRemoveFriend(acc),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FriendList;
