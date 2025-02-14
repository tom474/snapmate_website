import { FC, useCallback, useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import type { Account } from "../../../types";
import Tabs, { Tab } from "../../../components/Tabs";
import { URL_BASE } from "../../../config";
import UserList from "./UserList";
import { parseAccount } from "../../../types/account";
import useToast from "../../../hooks/useToast";

const AdminUsersPage: FC = () => {
  const toast = useToast();

  const [allUsers, setAllUsers] = useState<Account[]>([]);

  // Fetch
  const fetchAllUsers = useCallback(async () => {
    const endpoint = `${URL_BASE}/users`;
    const res = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
    });
    const result = await res.json();
    setAllUsers(result.map((acc: any) => parseAccount(acc)));
  }, []);

  const handleSuspendUser = useCallback(
    async (user: Account) => {
      const suspendUser = async () => {
        const endpoint = `${URL_BASE}/users/suspend/${user.id}`;

        try {
          const res = await fetch(endpoint, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            method: "PATCH",
          });
          if (res.ok) {
            await fetchAllUsers();
          } else {
            throw Error(`Failed to suspend ${user.displayName}`);
          }
        } catch (error: any) {
          console.error(error);
        }
      };

      toast.showAsync(suspendUser, {
        loading: {
          title: "Loading...",
        },
        success: (_: any) => ({
          title: `Suspended ${user.displayName} successfully`,
        }),
        error: (_: any) => ({
          title: "Something wrong happened",
        }),
      });
    },
    [fetchAllUsers, toast],
  );

  const handleResumeUser = useCallback(
    async (user: Account) => {
      const resumeUser = async () => {
        const endpoint = `${URL_BASE}/users/resume/${user.id}`;
        try {
          const res = await fetch(endpoint, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            method: "PATCH",
          });
          if (res.ok) {
            await fetchAllUsers();
          } else {
            throw Error(`Failed to resume ${user.displayName}`);
          }
        } catch (error: any) {
          console.error(error);
        }
      };

      toast.showAsync(resumeUser, {
        loading: {
          title: "Loading...",
        },
        success: (_: any) => ({
          title: `Resumed ${user.displayName} successfully`,
        }),
        error: (_: any) => ({
          title: "Something wrong happened",
        }),
      });
    },
    [fetchAllUsers, toast],
  );

  const tabs: Tab[] = [
    {
      name: "Active Users",
      element: (
        <UserList
          list={allUsers.filter((acc) => !acc.isSuspended)}
          actionFn={handleSuspendUser}
        />
      ),
    },
    {
      name: "Suspended Users",
      element: (
        <UserList
          list={allUsers.filter((acc) => acc.isSuspended)}
          actionFn={handleResumeUser}
        />
      ),
    },
  ];

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  return (
    <Layout mainClassName="overflow-y-hidden">
      <Tabs tabs={tabs} />
    </Layout>
  );
};

export default AdminUsersPage;
