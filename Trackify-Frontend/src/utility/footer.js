import ProfileIcon from "##/src/assets/images/icons/avatar.png";
import ClientIcon from "##/src/assets/images/icons/client.png";
import DashboardIcon from "##/src/assets/images/icons/dashboard.png";
import HolidaysIcon from "##/src/assets/images/icons/holidays.png";
import LogoutIcon from "##/src/assets/images/icons/logout.png";
import ProjectIcon from "##/src/assets/images/icons/monitor.png";
import ReportIcon from "##/src/assets/images/icons/pie-chart.png";
import SettingIcon from "##/src/assets/images/icons/settings.svg";

const MENUS = [
  "dashboard",
  "clients",
  "projects",
  "users",
  "reports",
  "holidays",
  "settings",
  "profile",
  "logout",
];

const MENU_LABELS = {
  dashboard: "Dashboard",
  clients: "Clients",
  projects: "Projects",
  users: "Users",
  reports: "Reports",
  summary: "Summary",
  holidays: "Holiday",
  profile: "Profile",
  settings: "Settings",
  logout: "Logout",
};

const MENU_PATH_ICONS = {
  dashboard: {
    link: "/dashboard",
    Icon: DashboardIcon,
    adminOnly: false,
  },
  clients: {
    link: "/clients",
    Icon: ClientIcon,
    adminOnly: true,
  },
  projects: {
    link: "/projects",
    Icon: ProjectIcon,
  },
  users: {
    link: "/users",
    Icon: ProfileIcon,
    adminOnly: true,
  },
  reports: {
    link: "/reports",
    Icon: ReportIcon,
  },
  holidays: {
    link: "/holidays",
    Icon: HolidaysIcon,
    adminOnly: false,
  },
  settings: {
    link: "/settings",
    Icon: SettingIcon,
    adminOnly: true,
  },
  profile: {
    link: "/profile",
    Icon: ProfileIcon,
    adminOnly: false,
  },
  logout: {
    link: "/logout",
    Icon: LogoutIcon,
    adminOnly: false,
  },
};

export { MENUS, MENU_LABELS, MENU_PATH_ICONS };
