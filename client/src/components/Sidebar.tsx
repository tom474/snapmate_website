import {
  Bell,
  Home,
  LogOut,
  type LucideIcon,
  Search,
  SquarePlus,
  User,
  UsersRound,
} from "lucide-react";
import type { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { URL_BASE } from "../config";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { mergeClassNames } from "../utils";

type SidebarItemBase = {
  Logo: LucideIcon;
  name: string;
  type?: "user" | "admin";
};

type SidebarInternalLinkItem = SidebarItemBase & {
  path: string;
};

type SidebarActionItem = SidebarItemBase & {
  onClick: () => void;
};

const internalLinkItems: SidebarInternalLinkItem[] = [
  {
    Logo: Home,
    name: "Home",
    path: "/",
    type: "user",
  },
  {
    Logo: Search,
    name: "Search",
    path: "/search",
    type: "user",
  },
  {
    Logo: Bell,
    name: "Notifications",
    path: "/notifications",
    type: "user",
  },
  {
    Logo: User,
    name: "Friends",
    path: "/friends",
    type: "user",
  },
  {
    Logo: UsersRound,
    name: "Groups",
    path: "/groups",
    type: "user",
  },
  {
    Logo: SquarePlus,
    name: "Create group",
    path: "/groups/create",
    type: "user",
  },
  {
    Logo: User,
    name: "Users",
    path: "/admin/users",
    type: "admin",
  },
  {
    Logo: UsersRound,
    name: "Groups",
    path: "/admin/groups",
    type: "admin",
  },
];

const Sidebar = () => {
  const { auth, setAuth } = useAuth();
  const toast = useToast();

  const location = useLocation();
  const navigate = useNavigate();

  const bottomActions: SidebarActionItem[] = [
    {
      Logo: LogOut,
      name: "Logout",
      onClick: () => {
        const logoutRequest = async () => {
          const endpoint = `${URL_BASE}/logout`;
          const res = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
          });

          if (res.ok) {
            setAuth({});
            toast.show({
              title: "Logged out successfully",
              type: "info",
            });
            navigate("/login");
          }
        };

        logoutRequest();
      },
    },
  ];

  return (
    <nav className="flex flex-col p-10 gap-8 border-r-2 border-border">
      {/* Logo */}
      <Link to="/" className="cursor-pointer flex items-center gap-3">
        <img
          className="size-10 object-cover mx-auto"
          style={{ maskSize: "cover", WebkitMaskSize: "cover" }}
          src="/logo.svg"
          alt="SnapMate logo"
        />
        <span className="font-bold text-3xl">SnapMate</span>
      </Link>

      {/* Navigation items */}
      <ul className="flex flex-col gap-3 w-full">
        {internalLinkItems.map((item, idx) => {
          if (item.type === "admin" && !auth.user?.isAdmin) return null;
          if (item.type === "user" && auth.user?.isAdmin) return null;

          return (
            <li key={idx}>
              <SidebarButton
                isActive={location.pathname === item.path}
                data={item}
                href={item.path}
              />
            </li>
          );
        })}
      </ul>
      {/* Bottom actions */}
      <div className="flex flex-col justify-end h-full w-full">
        <ul className="flex flex-col gap-3">
          {bottomActions.map((item, idx) => {
            return (
              <li key={idx}>
                <SidebarButton onClick={item.onClick} data={item} />
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

interface SidebarButtonProps {
  data: SidebarItemBase;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

const SidebarButton: FC<SidebarButtonProps> = ({
  data: { name, Logo },
  isActive,
  href,
  onClick,
}) => {
  if (href) {
    return (
      <Link
        to={href}
        className={mergeClassNames(
          "flex justify-start items-center gap-4 hover:bg-secondary py-3 px-4 w-full rounded-lg transition-all",
          isActive ? "bg-secondary" : "",
        )}
      >
        <Logo size={28} />
        <span className="text-lg">{name}</span>
      </Link>
    );
  }

  return (
    <button
      className={mergeClassNames(
        "flex justify-start items-center gap-4 hover:bg-secondary py-3 px-4 w-full rounded-lg transition-all",
        isActive ? "bg-secondary" : "",
      )}
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
    >
      <Logo size={28} />
      <span className="text-lg">{name}</span>
    </button>
  );
};

export default Sidebar;
