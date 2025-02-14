import React, { FC, useState } from 'react';

const ExcerptContent: FC<{ content: string; letterStrip?: number }> = ({
  content,
  letterStrip = 100,
}) => {
  const [showMore, setShowMore] = useState<boolean>(false);

  const shortContent = content.slice(0, letterStrip);
  const isContentLong = shortContent.length >= letterStrip;

  return (
    <>
      {showMore ? (
        <div>
          <p className="break-all">{content}</p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMore(false);
            }}
            className="inline text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {' '}
            ...show less
          </button>
        </div>
      ) : (
        <div>
          <p>{shortContent}</p>
          {isContentLong && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMore(true);
              }}
              className="inline text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {' '}
              ...show more
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ExcerptContent;
