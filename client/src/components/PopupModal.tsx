import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import { mergeClassNames } from '../utils';

interface PopupModalProps extends PropsWithChildren {
  widthPercent?: number;
  heightPercent?: number;
  className?: string;
  backdropBlur?: Number;
  expand?: boolean;
  modelRender: ReactNode;
}

const PopupModal: FC<PopupModalProps> = ({
  widthPercent = 0.5,
  heightPercent = 0.5,
  className,
  backdropBlur = 0,
  expand = false,
  modelRender,
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={mergeClassNames(className)}
      >
        {children}
      </div>
      {/* Popup */}
      {isOpen && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="fixed z-[100] top-0 left-0 w-screen h-screen flex justify-center items-center"
          style={{
            backdropFilter: `blur(${backdropBlur}px)`,
          }}
        >
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              maxWidth: `${widthPercent * 100}%`,
              maxHeight: `${heightPercent * 100}%`,
            }}
            className={mergeClassNames(
              'overflow-hidden',
              expand && 'size-full',
            )}
          >
            {modelRender}
          </div>
        </div>
      )}
    </>
  );
};

export default PopupModal;
