import Layout from '../../../components/Layout';
import GroupPanel from './GroupPanel';
import GroupRightSide from './GroupRightSide';

const GroupPage = () => {
  return (
    <Layout stickyRightSideCmp={<GroupRightSide />}>
      <GroupPanel />
    </Layout>
  );
};

export default GroupPage;
