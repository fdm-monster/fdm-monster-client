import Vue from "vue";
import App from "./App.vue";

// import "./registerServiceWorker";
import router from "./router";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueAxios from "vue-axios";
import { configureVeeValidate } from "@/plugins/veevalidate";
import { generateAppConstants } from "@/shared/app.constants";
import { registerFileDropDirective } from "@/directives/file-upload.directive";
import { createPinia, PiniaVuePlugin } from "pinia";
import BaseDialog from "@/components/Generic/Dialogs/BaseDialog.vue";
import { registerPrinterPlaceDirective } from "@/directives/printer-place.directive";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/vue";

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);

configureVeeValidate();
registerFileDropDirective();
registerPrinterPlaceDirective();

Sentry.init({
  Vue,
  dsn: "https://f64683e8d1cb4ac291434993cff1bf9b@o4503975545733120.ingest.sentry.io/4503975546912768",
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      // tracingOrigins: ["localhost", "monsterpi.local", /^\//],
    }),
    new Sentry.Replay(),
  ],
  enabled: process.env.NODE_ENV === "production",
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

Vue.use(PiniaVuePlugin);
Vue.component(BaseDialog.name, BaseDialog);

Vue.config.errorHandler = (err) => {
  console.error(`An error was caught [${err.name}]:\n ${err.message}\n ${err.stack}`);
};

new Vue({
  router,
  vuetify,
  provide: {
    appConstants: generateAppConstants(),
  },
  pinia: createPinia(),
  render: (h) => h(App),
}).$mount("#app");

console.log(
  "App Build UTC",
  document.documentElement.dataset.buildTimestampUtc,
  process.env.NODE_ENV
);
