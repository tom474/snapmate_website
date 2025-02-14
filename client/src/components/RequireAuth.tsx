import { FC, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";

interface Props {
  requireAdminAccess?: boolean;
}

const RequireAuth: FC<Props> = ({ requireAdminAccess }) => {
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Do nothing if user is found
    if (auth.user) {
      if (requireAdminAccess) {
        if (auth.user.isAdmin) {
          return;
        } else {
          navigate("/unauthorized", {
            state: {
              from: location,
            },
            replace: true,
          });
          return;
        }
      } else return;
    }

    // Else navigate them back to login page
    navigate("/login", {
      state: {
        from: location,
      },
      replace: true,
    });
  });

  // If admin, redirect to Admin Users page if it's in the "/" path
  useEffect(() => {
    if (auth.user?.isAdmin && location.pathname === "/") {
      navigate("/admin/users");
    }
  }, [auth.user?.isAdmin, location.pathname, navigate]);

  return <Outlet />;
};

export default RequireAuth;
