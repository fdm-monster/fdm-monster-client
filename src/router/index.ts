import VueRouter, { RouteConfig } from "vue-router";
import PrinterGridView from "@/components/PrinterGrid/PrinterGridView.vue";
import PrintersView from "@/components/PrinterList/PrintersView.vue";
import Settings from "../components/Settings/SettingsView.vue";
import AboutHelp from "../components/AboutHelp/AboutView.vue";
import PrintStatisticsView from "@/components/PrintStatistics/PrintStatisticsView.vue";
import OctoPrintSettings from "@/components/Settings/OctoPrintSettings.vue";
import EmergencyCommands from "../components/Settings/EmergencyCommands.vue";
import UserManagementSettings from "@/components/Settings/UserManagementSettings.vue";
import FloorSettings from "@/components/Settings/FloorSettings.vue";
import AccountSettings from "../components/Settings/AccountSettings.vue";
import GridSettings from "../components/Settings/GridSettings.vue";
import SoftwareUpgradeSettings from "../components/Settings/SoftwareUpgradeSettings.vue";
import DiagnosticsSettings from "../components/Settings/DiagnosticsSettings.vue";
import { useAuthStore } from "@/store/auth.store";
import LoginView from "../components/Login/LoginView.vue";
import NotFoundView from "../components/NotFound/NotFoundView.vue";
import PermissionDenied from "@/components/Login/PermissionDenied.vue";
import { RouteNames } from "@/router/route-names";

const NeedsAuth = {
  requiresAuth: true,
};
const NoAuth = {
  requiresAuth: false,
};

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: RouteNames.Home,
    meta: NeedsAuth,
    component: PrinterGridView,
  },
  {
    path: "/login",
    name: RouteNames.Login,
    meta: NoAuth,
    component: LoginView,
  },
  {
    path: "/printers",
    name: RouteNames.PrintersView,
    meta: NeedsAuth,
    component: PrintersView,
  },
  {
    path: "/settings",
    component: Settings,
    meta: NeedsAuth,
    children: [
      {
        path: "",
        meta: NeedsAuth,
        redirect: "grid",
      },
      {
        path: "account",
        meta: NeedsAuth,
        component: AccountSettings,
      },
      {
        path: "grid",
        meta: NeedsAuth,
        component: GridSettings,
      },
      {
        path: "floors",
        meta: NeedsAuth,
        component: FloorSettings,
      },
      {
        path: "user-management",
        meta: NeedsAuth,
        component: UserManagementSettings,
      },
      {
        path: "octoprint",
        meta: NeedsAuth,
        component: OctoPrintSettings,
      },
      {
        path: "emergency-commands",
        meta: NeedsAuth,
        component: EmergencyCommands,
      },
      {
        path: "software-upgrade",
        meta: NeedsAuth,
        component: SoftwareUpgradeSettings,
      },
      {
        path: "diagnostics",
        meta: NeedsAuth,
        component: DiagnosticsSettings,
      },
    ],
  },
  {
    path: "/statistics",
    name: RouteNames.PrintStatistics,
    meta: NeedsAuth,
    component: PrintStatisticsView,
  },
  {
    path: "/about",
    name: RouteNames.About,
    meta: NeedsAuth,
    component: AboutHelp,
  },
  {
    path: "/permission-denied",
    name: RouteNames.PermissionDenied,
    meta: NeedsAuth,
    component: PermissionDenied,
  },
  {
    path: "*",
    name: RouteNames.NotFound,
    meta: NoAuth,
    component: NotFoundView,
  },
];

const appRouter = new VueRouter({
  mode: "history",
  // @ts-ignore
  base: process.env.BASE_URL,
  routes,
});

appRouter.beforeEach(async (to, from, next) => {
  // This prevents login page from being shown when already logged in
  const authStore = useAuthStore();

  // Note that we do not let loginRequired === null coerce to false as that means its not loaded
  if (!to?.meta?.requiresAuth || authStore.loginRequired === false) {
    console.debug(`No auth required on route ${to.fullPath}`);
    return next();
  }

  authStore.loadTokens();
  if (!authStore.hasAuthToken && !authStore.hasRefreshToken) {
    console.debug("Not logged in, redirecting to login page");
    if (from.path == "/login") {
      throw new Error("Already on login page, cannot redirect");
    }
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }

  return next();
});

export default appRouter;
