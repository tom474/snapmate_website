import { FC } from 'react';
import type { Account } from '../types';
import AccInfo from './AccInfo';

interface AccInfoWithTextBtnProps {
  data: Account;
  button: {
    text: string;
    actionFn: () => void;
  };
}

const AccInfoWithTextBtn: FC<AccInfoWithTextBtnProps> = ({
  data,
  button: { text: btnText, actionFn },
}) => {
  return (
    <AccInfo
      data={data}
      rightSideCmp={
        <button
          onClick={(e) => {
            e.preventDefault();
            actionFn();
          }}
          className="rounded-full bg-white hover:bg-slate-300 text-black px-4 py-2 text-sm font-bold"
        >
          {btnText}
        </button>
      }
    />
  );
};

export default AccInfoWithTextBtn;
