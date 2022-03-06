import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'
import { vueErrorHandler } from './handlers/error.handler';
import {registerFileDropDirective} from "@/directives/file-upload.directive";

import NavigationDrawer from "@/components/NavigationDrawer.vue";
import FileExplorerSideNav from "@/components/SideNavs/FileExplorerSideNav.vue";
import PrintJobsMenu from "@/components/PrintJobsMenu.vue";
import {configureVeeValidate} from "@/plugins/veevalidate";

await loadFonts();
configureVeeValidate();

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(vuetify)
    .component('NavigationDrawer', NavigationDrawer)
    .component('PrintJobsMenu', PrintJobsMenu)
    .component('FileExplorerSideNav', FileExplorerSideNav);

registerFileDropDirective(app);

app.config.errorHandler = vueErrorHandler;
app.mount('#app');