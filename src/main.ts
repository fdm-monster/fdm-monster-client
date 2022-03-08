import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createPinia } from "pinia";
import { vueErrorHandler } from "./handlers/error.handler";
import { registerFileDropDirective } from "@/directives/file-upload.directive";

import CalendarView from "@/components/PrintScheduling/CalendarView.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import FileExplorerSideNav from "@/components/SideNavs/FileExplorerSideNav.vue";
import PrintJobsMenu from "@/components/PrintJobsMenu.vue";
import { configureVeeValidate } from "@/plugins/veevalidate";
import FileControlList from "@/components/PrinterList/FileControlList.vue";
import PrinterDeleteAction from "@/components/Actions/PrinterDeleteAction.vue";
import RefreshFilesAction from "@/components/Actions/RefreshFilesAction.vue";
import PrinterCrudForm from "@/components/Forms/PrinterCrudForm.vue";
import PrinterChecksPanel from "@/components/Dialogs/PrinterChecksPanel.vue";
import PrinterDetails from "@/components/PrinterList/PrinterDetails.vue";
import BatchJsonCreateDialog from "@/components/Dialogs/BatchJsonCreateDialog.vue";
import UpdatePrinterDialog from "@/components/Dialogs/UpdatePrinterDialog.vue";
import CreatePrinterDialog from "@/components/Dialogs/CreatePrinterDialog.vue";
import PrinterUrlAction from "@/components/Actions/PrinterUrlAction.vue";
import PrinterSettingsAction from "@/components/Actions/PrinterSettingsAction.vue";
import PrinterConnectionAction from "@/components/Actions/PrinterConnectionAction.vue";
import draggable from "vuedraggable";

await loadFonts();
configureVeeValidate();

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(vuetify)
  .component("FileControlList", FileControlList)
  .component("UpdatePrinterDialog", UpdatePrinterDialog)
  .component("CreatePrinterDialog", CreatePrinterDialog)
  .component("BatchJsonCreateDialog", BatchJsonCreateDialog)
  .component("PrinterDeleteAction", PrinterDeleteAction)
  .component("RefreshFilesAction", RefreshFilesAction)
  .component("PrinterUrlAction", PrinterUrlAction)
  .component("PrinterSettingsAction", PrinterSettingsAction)
  .component("PrinterConnectionAction", PrinterConnectionAction)
  .component("PrinterCrudForm", PrinterCrudForm)
  .component("PrinterChecksPanel", PrinterChecksPanel)
  .component("CalendarView", CalendarView)
  .component("NavigationDrawer", NavigationDrawer)
  .component("PrintJobsMenu", PrintJobsMenu)
  .component("FileExplorerSideNav", FileExplorerSideNav)
  .component("PrinterDetails", PrinterDetails)
  .component("draggable", draggable);

registerFileDropDirective(app);

app.config.errorHandler = vueErrorHandler;
app.mount("#app");