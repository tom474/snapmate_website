import {
  FC,
  HtmlHTMLAttributes,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import useDebounce from '../../hooks/useDebounce';
import { mergeClassNames } from '../../utils';

interface MenuProps extends PropsWithChildren {
  hoverable?: boolean;
  asChild?: boolean;
  content: ReactElement;
  expandWidth?: boolean;
  className?: string;
}

const DropDownMenu: FC<MenuProps> = ({
  children,
  hoverable = false,
  asChild = false,
  content,
  expandWidth = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isMouseIn, setIsMouseIn] = useState<boolean>(false);
  const debouncedMouseExit = useDebounce<boolean>(isMouseIn);

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    if (!hoverable) return;
    setIsMouseIn(true);
    setIsOpen(true);
  };

  const handleLeave = () => {
    if (!hoverable) return;
    setIsMouseIn(false);
  };

  useEffect(() => {
    if (!debouncedMouseExit) setIsOpen(false);
  }, [debouncedMouseExit]);

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  // Function to handle clicks outside the dropdown
  // event type is any since TypeScript is stupid enough to not figure out what MouseEvent
  const handleClickOutside = (event: any) => {
    if (
      dropdownRef.current &&
      dropdownRef.current.contains(event.target as Node)
    )
      return;
    if (triggerRef.current && triggerRef.current.contains(event.target as Node))
      return;
    setIsOpen(false);
  };

  // useEffect to detect clicks outside the dropdown
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={mergeClassNames('relative', expandWidth && 'w-full')}>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={mergeClassNames(
          'relative',
          asChild
            ? ''
            : 'flex items-center size-fit gap-2 hover:bg-secondary/50 rounded-lg p-2',
          className,
        )}
      >
        {children}
      </div>
      {isOpen && <div ref={dropdownRef}>{content}</div>}
    </div>
  );
};

interface ContentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  layout?: 'verticle' | 'horizontal';
}

const DropDownMenuContent: FC<ContentProps> = ({
  layout = 'verticle',
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={mergeClassNames(
        'z-30 flex gap-2 absolute top-[calc(100%+0.25rem)] left-0',
        'bg-background p-2 border-border border-solid border-2 rounded-lg w-fit',
        // 'invisible opacity-0 transition-opacity duration-300',
        layout == 'verticle' ? 'flex-col' : '',
        className,
      )}
    >
      {props.children}
    </div>
  );
};

interface ItemProps extends PropsWithChildren {
  asChild?: boolean;
  onClick?: () => void;
}

const DropDownItem: FC<ItemProps> = ({ children, asChild, onClick }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      className={mergeClassNames(
        'rounded-sm w-full text-nowrap',
        !asChild && 'p-2 hover:bg-secondary',
      )}
    >
      {children}
    </div>
  );
};

export { DropDownMenu, DropDownMenuContent, DropDownItem };
