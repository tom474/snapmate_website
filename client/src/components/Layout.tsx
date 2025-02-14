import { FC, PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import { mergeClassNames } from '../utils';

const Layout: FC<
  PropsWithChildren & {
    stickyRightSideCmp?: React.ReactNode;
    mainClassName?: string;
  }
> = ({ children, stickyRightSideCmp, mainClassName }) => {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen overflow-hidden scrollbar-hide p-10">
        <div className="flex justify-center gap-10 mx-auto w-screen max-w-[60vw] h-screen overflow-hidden pb-20">
          <main
            className={mergeClassNames(
              'max-w-[70%] flex-auto overflow-y-auto overflow-x-clip pr-4',
              mainClassName,
            )}
          >
            {children}
          </main>
          {stickyRightSideCmp && (
            <aside className="w-[30%] max-w-[300px] h-screen overflow-y-scroll">
              {stickyRightSideCmp}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
