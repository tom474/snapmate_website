import { Globe, Lock } from 'lucide-react';
import { Check, Plus, UserRoundCheck } from 'lucide-react';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Group, GroupVisibility } from '../types/group';

interface GroupInfoProps {
  data: Group;
  button?: {
    type: 'toRequest' | 'requestSent' | 'member';
    onClick?: () => void;
  };
}

const CompactedGroup: FC<GroupInfoProps> = ({ data, button }) => {
  const buttonCmp = !button
    ? null
    : (() => {
      const handleOnClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      ) => {
        e.preventDefault();
        button.onClick?.();
      };

      switch (button.type) {
        case 'toRequest':
          return (
            <button
              onClick={handleOnClick}
              className="rounded-full p-1.5 bg-blue-100 hover:bg-blue-200"
            >
              <Plus size={16} className="stroke-blue-900" />
            </button>
          );
        case 'requestSent':
          return (
            <button className="rounded-full p-1.5 bg-gray-100 cursor-default">
              <Check size={16} className="stroke-gray-900" />
            </button>
          );
        case 'member':
          return (
            <button className="rounded-full p-1.5 bg-green-100">
              <UserRoundCheck size={16} className="stroke-green-900" />
            </button>
          );
      }
    })();

  return (
    <Link
      to={`/groups/${data.id}`}
      className="rounded-md flex justify-between items-center px-2 py-3 hover:bg-secondary/50 cursor-pointer transition-colors"
    >
      <div className="flex gap-2 items-center justify-start">
        <div className="min-h-12 min-w-12 size-12 overflow-hidden rounded-full bg-gray-500">
          {data.groupImage && (
            <img
              className="object-cover size-12"
              src={data.groupImage}
              alt="Group"
            />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base">{data.name}</p>
            {data.visibility === GroupVisibility.PUBLIC ? (
              <Globe size={16} />
            ) : (
              <Lock size={16} />
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {data.description}
          </p>
        </div>
      </div>

      {buttonCmp}
    </Link>
  );
};

export default CompactedGroup;
