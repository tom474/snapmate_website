import { FC } from 'react';
import Layout from '../../components/Layout';
import NotificationList from './NotificationList';

const NotificationsPage: FC = () => {
  return (
    <Layout mainClassName="overflow-y-hidden">
      <NotificationList />
    </Layout>
  );
};

export default NotificationsPage;
