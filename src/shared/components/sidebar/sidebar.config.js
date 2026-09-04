import { FiGrid, FiBook, FiLayers, FiLogOut, FiPieChart, FiFileText } from 'react-icons/fi';

// Configuration file for the Sidebar component defining menu items, footer items, and logo assets.
export const sidebarConfig = {
  logo: {
    title: "Scientia",
    subtitle: "Bibliometric Excellence",
  },
  userProfile: {
    initials: "JR",
    name: "Dr. Julian Reed",
    role: "Senior Analyst"
  },
  menuItems: [
    { label: "Dashboard", segment: "dashboard", icon: FiGrid },
    { label: "Journals", segment: "journals", icon: FiBook },
    { label: "Volumes", segment: "volumes", icon: FiLayers },
    { label: "Analytics", segment: "analytics", icon: FiPieChart }
  ],
  footerItems: [
    { label: "Export PDF", action: "export-pdf", icon: FiFileText },
    { label: "Go Home", action: "logout", icon: FiLogOut }
  ]
};
