import { useState, ReactNode, FC } from 'react';
import { mergeClassNames } from '../utils';

interface Props {
  tabs: Tab[];
  defaultTab?: number;
}

type Tab = {
  name: string;
  element: ReactNode;
  condition?: () => boolean;
};

const Tabs: FC<Props> = ({ tabs, defaultTab = 0 }) => {
  const filteredTabs = tabs.filter((tab) => !tab.condition || tab.condition());

  const getInitialTab = (): number => {
    if (filteredTabs.length === 0) return -1; // If no tabs are available
    const validDefault = filteredTabs[defaultTab];
    return validDefault ? defaultTab : 0;
  };

  const [selected, setSelected] = useState<number>(getInitialTab);

  if (filteredTabs.length === 0) return null; // If no tabs are available, render nothing

  return (
    <>
      <div className="flex w-full justify-center [&>*]:flex-1">
        {filteredTabs.map((tab, idx) => {
          return (
            <button
              key={idx}
              className={mergeClassNames(
                'text-center border-b-2 py-4 px-8 text-lg hover:bg-secondary transition-all',
                selected !== idx
                  ? 'border-b-transparent'
                  : 'border-b-primary text-primary font-bold',
              )}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(idx);
              }}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
      <div className="overflow-y-scroll size-full scrollbar-hide">
        {filteredTabs[selected]?.element}
      </div>
    </>
  );
};

export type { Tab };
export default Tabs;
