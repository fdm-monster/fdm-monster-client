import Vue from "vue";
import App from "./App.vue";
import pinia from "./plugins/pinia";
import VueRouter from "vue-router";
import appRouter from "./router";
import vuetify from "./plugins/vuetify";
import { configureVeeValidate } from "@/plugins/veevalidate";
import { generateAppConstants } from "@/shared/app.constants";
import { registerFileDropDirective } from "@/directives/file-upload.directive";
import { PiniaVuePlugin } from "pinia";
import { registerPrinterPlaceDirective } from "@/directives/printer-place.directive";
import * as Sentry from "@sentry/vue";
import { browserTracingIntegration, captureException, replayIntegration } from "@sentry/vue";
import { useSnackbar } from "./shared/snackbar.composable";
import { AxiosError } from "axios";
import { VueQueryPlugin } from "@tanstack/vue-query";
import BaseDialog from "@/components/Generic/Dialogs/BaseDialog.vue";
import { version as packageJsonVersion } from "../package.json";

Vue.config.productionTip = false;
Vue.config.silent = true;
Vue.config.devtools = false;

configureVeeValidate();
registerFileDropDirective();
registerPrinterPlaceDirective();

console.debug("Production", process.env.NODE_ENV === "production");
Sentry.init({
  Vue,
  dsn: "https://f64683e8d1cb4ac291434993cff1bf9b@o4503975545733120.ingest.sentry.io/4503975546912768",
  integrations: [
    browserTracingIntegration({
      router: appRouter,
    }),
    replayIntegration(),
  ],

  release: packageJsonVersion,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

Vue.use(PiniaVuePlugin);
Vue.use(VueRouter);
Vue.component("BaseDialog", BaseDialog);

Vue.config.errorHandler = (err) => {
  if (err instanceof AxiosError) {
    console.error(
      `An error was caught [${err.name}]:\n ${err.message}\n ${err.config?.url}\n${err.stack}`
    );
    useSnackbar().openErrorMessage({
      title: "An error occurred",
      subtitle: err.message,
      timeout: 5000,
    });
    return;
  } else {
    console.error(`An error was caught [${err.name}]:\n ${err.message}\n ${err.stack}`);
  }
  useSnackbar().openErrorMessage({
    title: "An error occurred",
    subtitle: err.message,
    timeout: 5000,
  });

  captureException(err);
};

Vue.use(VueQueryPlugin);

new Vue({
  pinia,
  router: appRouter,
  vuetify,
  provide: {
    appConstants: generateAppConstants(),
  },
  render: (h) => h(App),
}).$mount("#app");

console.debug(
  "App Build UTC",
  document.documentElement.dataset.buildTimestampUtc,
  process.env.NODE_ENV
);
