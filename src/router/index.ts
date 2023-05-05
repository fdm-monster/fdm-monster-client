import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import PrinterGridView from "@/components/PrinterGrid/PrinterGridView.vue";
import PrintersView from "@/components/PrinterList/PrintersView.vue";
import Settings from "../components/Settings/SettingsView.vue";
import AboutHelp from "../components/AboutHelp/AboutView.vue";
import PrintStatisticsView from "@/components/PrintStatistics/PrintStatisticsView.vue";
import FdmSettings from "@/components/Settings/FdmSettings.vue";
import ServerRelatedSettings from "@/components/Settings/ServerRelatedSettings.vue";
import UserManagementSettings from "@/components/Settings/UserManagementSettings.vue";
import FloorSettings from "@/components/Settings/FloorSettings.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: PrinterGridView,
  },
  {
    path: "/printers",
    name: "PrintersView",
    component: PrintersView,
  },
  {
    path: "/settings",
    component: Settings,
    children: [
      {
        path: "",
        redirect: "floors",
      },
      {
        path: "floors",
        component: FloorSettings,
      },
      {
        path: "user-management",
        component: UserManagementSettings,
      },
      {
        path: "system",
        component: FdmSettings,
      },
      {
        path: "server-related",
        component: ServerRelatedSettings,
      },
    ],
  },
  {
    path: "/statistics",
    name: "Print Statistics",
    component: PrintStatisticsView,
  },
  {
    path: "/about",
    name: "About",
    component: AboutHelp,
  },
  {
    path: "*",
    name: "NotFound",
    component: () => import(/* webpackChunkName: "about" */ "../views/NotFoundView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
