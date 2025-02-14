import Layout from "../../../components/Layout";
import { useLoaderData, useParams } from "react-router";
import GroupPanel from "../../groups/group/GroupPanel";
import PostPanel from "./PostPanel";
import { parsePost, Posts } from "../../../types/post";

const PostPage = () => {
  return (
    <Layout stickyRightSideCmp={<></>}>
      <PostPanel />
    </Layout>
  );
};

export default PostPage;
