import PrinterGrid from "@/components/PrinterGrid/PrinterGrid.vue";
import { createRouter, createWebHistory } from "vue-router";
import HomePrinterGrid from "../views/HomePrinterGrid.vue";
import Settings from "../views/Settings.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePrinterGrid,
    },
    {
      path: "/printers",
      name: "Printers",
      component: PrinterGrid,
    },
    {
      path: "/settings",
      component: Settings,
    },
    //   children: [
    //     {
    //       path: "",
    //       redirect: "printer-groups"
    //     },
    //     {
    //       path: "user-management",
    //       component: UserManagementSettings
    //     },
    //     {
    //       path: "printer-groups",
    //       component: PrinterGroupsSettings
    //     },
    //     {
    //       path: "system",
    //       component: FdmSettings
    //     },
    //     {
    //       path: "other",
    //       component: OtherSettings
    //     }
    //   ]
    // },
    // {
    //   path: "/scheduling",
    //   name: "Scheduling",
    //   component: Scheduling
    // },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () =>
        import(/* webpackChunkName: "about" */ "../views/NotFound.vue"),
    },
  ],
});

export default router;
