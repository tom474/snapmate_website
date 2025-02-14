import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import RequireAuth from './components/RequireAuth';
import { URL_BASE } from './config';
import { AuthProvider } from './context/AuthProvider';
import ToastProvider from './context/ToastProvider';
import AdminUsersPage from './pages/admin/users';
import AdminGroupsPage from './pages/admin/groups';
import Error from './pages/error';
import FriendsPage from './pages/friends';
import JoinedGroups from './pages/groups';
import CreateGroupForm from './pages/groups/create_group';
import GroupPage from './pages/groups/group';
import HomePage from './pages/home';
import LoginRegisterForm, { formState } from './pages/auth';
import NotificationsPage from './pages/notifications';
import PostPage from './pages/posts/post';
import Search from './pages/search';
import Unauthorized from './pages/unauthorized';
import UserPage from './pages/users/user';
import { parseGroup } from './types/group';
import { parseAccount } from './types/account';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRegisterForm />,
  },
  {
    path: '/register',
    element: <LoginRegisterForm initialState={formState.SIGNUP} />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/posts/:postId',
        element: <PostPage />,
        loader: async ({ params }) => {
          const endpoint = `${URL_BASE}/posts/${params.postId}`;
          const res = await fetch(endpoint, {
            method: 'GET',
            credentials: 'include',
          });
          return await res.json();
        },
      },
      {
        path: '/friends',
        element: <FriendsPage />,
      },
      {
        path: '/users/:userId',
        element: <UserPage />,
        loader: async ({ params }) => {
          const endpoint = `http://localhost:8080/users/${params.userId}`;
          const res = await fetch(endpoint, {
            method: 'GET',
            credentials: 'include',
          });
          const data = await res.json();
          return parseAccount(data);
        },
      },
      {
        path: 'groups',
        children: [
          {
            path: '',
            element: <JoinedGroups />,
          },
          {
            path: 'create',
            element: <CreateGroupForm />,
          },
          {
            path: ':groupId',
            element: <GroupPage />,
            loader: async ({ params }) => {
              try {
                const endpoint = `${URL_BASE}/groups/${params.groupId}`;
                const res = await fetch(endpoint, {
                  method: 'GET',
                  credentials: 'include',
                });

                const data = await res.json();
                const groupData = parseGroup(data);

                return groupData;
              } catch (error) {}
            },
          },
        ],
      },
    ],
  },
  {
    element: <RequireAuth requireAdminAccess />,
    children: [
      {
        path: 'admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: 'admin/groups',
        element: <AdminGroupsPage />,
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <Error />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex App text-foreground bg-background min-h-svh">
          <RouterProvider router={router} />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
