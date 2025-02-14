import { FC } from 'react';
import { mergeClassNames } from '../utils';

interface Props {
  alignment?: 'horizontal' | 'verticle';
}

const Divider: FC<Props> = ({ alignment }) => {
  return (
    <div
      className={mergeClassNames(
        'border-border border border-solid',
        alignment == 'verticle' ? 'w-0 h-full' : 'w-full h-0',
      )}
    ></div>
  );
};

export default Divider;
