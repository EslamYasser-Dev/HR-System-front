export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "HR System",
  description: "employees managment system for HRs",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Attendance",
      href: "/attendance",
    },
    {
      label: "Employees",
      href: "/employees",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Attendance",
      href: "/attendance",
    },
    {
      label: "Employees",
      href: "/employees",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/EslamYasser-Dev/HR-System",
    linkedin: "https://www.linkedin.com/in/eslamyasser",
  },
};
