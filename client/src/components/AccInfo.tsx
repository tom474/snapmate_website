import { FC } from 'react';
import type { Account } from '../types';
import { Link } from 'react-router-dom';

interface AccInfoProps {
  data: Account;
  rightSideCmp?: React.ReactNode;
}

const AccInfo: FC<AccInfoProps> = ({
  data: { id, username, displayName, imgUrl },
  rightSideCmp,
}) => {
  return (
    <Link
      to={`/users/${id}`}
      className="cursor-pointer flex items-center px-2 py-3 justify-between rounded-md hover:bg-secondary/50"
    >
      <div className="flex items-center gap-2">
        <img
          src={imgUrl}
          className="rounded-full bg-gray-500 size-12"
          alt={username}
        />
        <div>
          <p className="text-base">{displayName}</p>
          <p className="text-sm text-gray-500">@{username}</p>
        </div>
      </div>
      {rightSideCmp && rightSideCmp}
    </Link>
  );
};

export default AccInfo;
