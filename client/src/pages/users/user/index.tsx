import { useLoaderData } from 'react-router';
import Layout from '../../../components/Layout';
import { Account } from '../../../types';
import UserPanel from './UserPanel';

const UserPage = () => {
  const userData = useLoaderData() as Account;

  return (
    <Layout>
      <UserPanel userData={userData} />
    </Layout>
  );
};

export default UserPage;
