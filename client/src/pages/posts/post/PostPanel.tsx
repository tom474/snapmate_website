import { useState } from 'react';
import { useLoaderData } from 'react-router';
import Post from '../../../components/Post';
import { parsePost, Posts } from '../../../types/post';

const PostPanel = () => {
  const postData = useLoaderData();
  const [post, setPost] = useState<Posts>(parsePost(postData));

  return (
    <Post
      onSuccessDelete={() => {}}
      onSuccessEdit={(post) => setPost(post)}
      data={post}
    />
  );
};

export default PostPanel;
