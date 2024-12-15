export const settingPage = {
  grid: "grid",
  floors: "floors",
  octoprint: "octoprint",
  emergencyCommands: "emergencyCommands",
  users: "users",
  account: "account",
  serverProtection: "serverProtection",
  softwareUpgrade: "softwareUpgrade",
  diagnostics: "diagnostics",
  experimental: "experimental",
} as const;

export const settingsPage = {
  [settingPage.grid]: {
    title: "Grid",
    icon: "grid_on",
    path: "/settings/grid",
    divider: false,
  },
  [settingPage.floors]: {
    title: "Floors",
    icon: "house_siding",
    path: "/settings/floors",
    divider: true,
  },
  [settingPage.octoprint]: {
    title: "OctoPrint",
    icon: "image",
    path: "/settings/octoprint",
    divider: false,
  },
  [settingPage.emergencyCommands]: {
    title: "Emergency Commands",
    icon: "warning",
    path: "/settings/emergency-commands",
    divider: true,
  },
  [settingPage.users]: {
    title: "Users",
    icon: "group",
    path: "/settings/user-management",
    divider: false,
  },
  [settingPage.account]: {
    title: "Account",
    icon: "account_circle",
    path: "/settings/account",
    divider: false,
  },
  [settingPage.serverProtection]: {
    title: "Server Protection",
    icon: "security",
    path: "/settings/server-protection",
    divider: true,
  },
  [settingPage.softwareUpgrade]: {
    title: "Software Upgrade",
    icon: "upgrade",
    path: "/settings/software-upgrade",
    divider: false,
  },
  [settingPage.diagnostics]: {
    title: "Diagnostics",
    icon: "bug_report",
    path: "/settings/diagnostics",
    divider: false,
  },
  [settingPage.experimental]: {
    title: "Experimental",
    icon: "settings_applications",
    path: "/settings/experimental",
    divider: false,
  },
} as const;
