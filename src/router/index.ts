import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import HomePrinterGrid from "@/views/PrinterGridView.vue";
import PrintersView from "@/components/PrinterList/PrintersView.vue";
import Settings from "@/views/SettingsView.vue";
import About from "@/views/AboutView.vue";
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
    component: HomePrinterGrid,
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
    component: About,
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
