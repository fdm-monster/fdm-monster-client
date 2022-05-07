import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import { vueErrorHandler } from "./handlers/error.handler";
import { registerFileDropDirective } from "@/directives/file-upload.directive";

import draggable from "vuedraggable";
import { sseClientPlugin } from "@/plugins/sse-client/sse-client-plugin";
import { apiBase } from "@/backend/base.service";
import { SchemaFormWithValidation } from "@/plugins/veevalidate";

await loadFonts();

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(vuetify)
  .use(sseClientPlugin, {
    format: "json",
    polyfill: true,
    url: apiBase + "/api/printer/sse",
  })
  .component("SchemaFormWithValidation", SchemaFormWithValidation)
  .component("draggable", draggable);

registerFileDropDirective(app);

app.config.errorHandler = vueErrorHandler;
app.mount("#app");
