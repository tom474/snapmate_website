import { FC } from 'react';
import { Check, Plus, UserRoundCheck, X } from 'lucide-react';
import type { Account } from '../types';
import AccInfo from './AccInfo';

type AccIconBtnType =
  | 'alreadyFriend'
  | 'add'
  | 'accept'
  | 'reject'
  | 'requestSent';

interface AccInfoWithIconButtonsProps {
  data: Account;
  buttons: {
    type: AccIconBtnType;
    onClick?: () => void;
  }[];
}

const AccInfoWithIconButtons: FC<AccInfoWithIconButtonsProps> = ({
  data,
  buttons,
}) => {
  return (
    <AccInfo
      data={data}
      rightSideCmp={
        <div className="flex items-center gap-2">
          {buttons.map((btn) => getIconBtn(btn.type, btn.onClick))}
        </div>
      }
    />
  );
};

export default AccInfoWithIconButtons;

const getIconBtn = (type: AccIconBtnType, onClick?: () => void) => {
  const handleOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    onClick?.();
  };

  switch (type) {
    case 'alreadyFriend':
      return (
        <button className="rounded-full p-1.5 bg-green-100">
          <UserRoundCheck size={16} className="stroke-green-900" />
        </button>
      );
    case 'accept':
      return (
        <button
          onClick={handleOnClick}
          className="rounded-full p-1.5 bg-green-100 hover:bg-green-200"
        >
          <Check size={16} className="stroke-green-900" />
        </button>
      );
    case 'requestSent':
      return (
        <button className="rounded-full p-1.5 bg-gray-100 cursor-default">
          <Check size={16} className="stroke-gray-900" />
        </button>
      );
    case 'add':
      return (
        <button
          onClick={handleOnClick}
          className="rounded-full p-1.5 bg-blue-100 hover:bg-blue-200"
        >
          <Plus size={16} className="stroke-blue-900" />
        </button>
      );
    case 'reject':
      return (
        <button
          onClick={handleOnClick}
          className="rounded-full p-1.5 bg-red-100 hover:bg-red-200"
        >
          <X size={16} className="stroke-red-900" />
        </button>
      );
  }
};
