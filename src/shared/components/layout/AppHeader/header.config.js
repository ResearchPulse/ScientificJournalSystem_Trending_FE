import { FiBell, FiSettings, FiHelpCircle } from 'react-icons/fi';

export const headerConfig = {
  searchPlaceholder: "Tìm kiếm danh mục, bài báo...",
  icons: [
    {
      id: "notifications",
      icon: FiBell,
      ariaLabel: "Notifications"
    },
    {
      id: "settings",
      icon: FiSettings,
      ariaLabel: "Settings"
    },
    {
      id: "help",
      icon: FiHelpCircle,
      ariaLabel: "Help"
    }
  ]
};
