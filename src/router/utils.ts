import VueRouter from "vue-router";
import { RouteNames } from "./index";

export async function routeToPath(router: VueRouter, name: string) {
  return router.push({ name: name });
}

export async function routeToLogin(router: VueRouter) {
  // Prevent redundant or circular routing
  if (router.currentRoute.path === "/login") {
    console.log("routeToLogin: already at login page");
    return;
  }
  return routeToPath(router, RouteNames.Login);
}

export async function routeToHome(router: VueRouter) {
  // Prevent redundant or circular routing
  if (router.currentRoute.path === "/") {
    return;
  }
  return routeToPath(router, RouteNames.Home);
}
