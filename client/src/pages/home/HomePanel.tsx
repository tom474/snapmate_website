import { FC, useRef } from 'react';
import PostCreationPanel from '../../components/PostCreationPanel';
import PostsView, { PostsViewRef } from '../../components/PostsView';
import { URL_BASE } from '../../config';

const HomePanel: FC<{
  className?: string;
}> = ({ className }) => {
  const postsViewRef = useRef<PostsViewRef>(null);

  return (
    <div className={className}>
      {/* Post something */}
      <PostCreationPanel
        onPostUpload={() => {
          postsViewRef.current?.reset();
          postsViewRef.current?.fetchPosts();
        }}
      />
      <PostsView ref={postsViewRef} fetchEndpoint={`${URL_BASE}/posts`} />
    </div>
  );
};

export default HomePanel;
