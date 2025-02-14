import { FC } from 'react';
import type { Account } from '../../../types';
import AccInfoWithTextBtn from '../../../components/AccInfoWithTextBtn';

interface UserListProps {
  list: Account[];
  actionFn: (acc: Account) => void;
}

const UserList: FC<UserListProps> = ({ list, actionFn }) => {
  return (
    <div className="mt-2 flex flex-col h-[calc(100vh-180px)]">
      <div className="flex-[1] overflow-y-auto pr-3">
        {list.map((acc) => (
          <AccInfoWithTextBtn
            key={acc.id}
            data={acc}
            button={{
              text: acc.isSuspended ? 'Resume' : 'Suspend',
              actionFn: () => actionFn(acc),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UserList;
