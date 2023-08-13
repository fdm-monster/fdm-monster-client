<template>
  <v-app>
    <AppInfoSnackbar />
    <AppErrorSnackbar />
    <AppProgressSnackbar />
    <AlertErrorDialog />

    <NavigationDrawer />
    <TopBar />

    <v-main>
      <router-view />
    </v-main>
    <AddOrUpdatePrinterDialog />
    <AddOrUpdateFloorDialog />
    <PrinterMaintenanceDialog />
    <BatchJsonCreateDialog />
    <YamlImportExportDialog />
    <FileExplorerSideNav />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavigationDrawer from "@/components/Generic/NavigationDrawer.vue";
import TopBar from "@/components/Generic/TopBar.vue";
import FileExplorerSideNav from "./components/Generic/FileExplorerSideNav.vue";
import AddOrUpdatePrinterDialog from "./components/Generic/Dialogs/AddOrUpdatePrinterDialog.vue";
import AddOrUpdateFloorDialog from "./components/Generic/Dialogs/AddOrUpdateFloorDialog.vue";
import PrinterMaintenanceDialog from "@/components/Generic/Dialogs/PrinterMaintenanceDialog.vue";
import { useUploadsStore } from "@/store/uploads.store";
import { usePrinterStore } from "./store/printer.store";
import { useSettingsStore } from "./store/settings.store";
import { SocketIoService } from "./shared/socketio.service";
import { useDialogsStore } from "@/store/dialog.store";
import BatchJsonCreateDialog from "@/components/Generic/Dialogs/BatchJsonCreateDialog.vue";
import YamlImportExportDialog from "@/components/Generic/Dialogs/YamlImportExportDialog.vue";
import { useFeatureStore } from "./store/features.store";
import { setSentryEnabled } from "./utils/sentry.util";
import { useSnackbar } from "./shared/snackbar.composable";
import AppProgressSnackbar from "./components/Generic/Snackbars/AppProgressSnackbar.vue";
import AlertErrorDialog from "./components/Generic/Snackbars/AlertErrorDialog.vue";
import AppErrorSnackbar from "./components/Generic/Snackbars/AppErrorSnackbar.vue";
import AppInfoSnackbar from "./components/Generic/Snackbars/AppInfoSnackbar.vue";
import { uploadProgressTest } from "./utils/test.util";
import isURL from "validator/lib/isURL";

interface Data {
  socketIoClient?: SocketIoService;
}

export default defineComponent({
  name: "AppView",
  components: {
    AppInfoSnackbar,
    AppErrorSnackbar,
    AlertErrorDialog,
    AppProgressSnackbar,
    YamlImportExportDialog,
    TopBar,
    NavigationDrawer,
    AddOrUpdatePrinterDialog,
    AddOrUpdateFloorDialog,
    PrinterMaintenanceDialog,
    FileExplorerSideNav,
    BatchJsonCreateDialog,
  },
  setup: () => {
    return {
      uploadsStore: useUploadsStore(),
      printersStore: usePrinterStore(),
      settingsStore: useSettingsStore(),
      featureStore: useFeatureStore(),
      dialogsStore: useDialogsStore(),
      snackbar: useSnackbar(),
    };
  },
  async mounted() {
    console.debug("App.vue mounted");
    await this.settingsStore.loadSettings();
    const enabled = this.settingsStore.serverSettings?.sentryDiagnosticsEnabled;
    setSentryEnabled(!!enabled);

    await this.featureStore.loadFeatures();
    await this.connectSocketIoClient();

    uploadProgressTest(false);
  },
  beforeDestroy() {
    this.socketIoClient?.disconnect();
  },
  props: {},
  data: (): Data => ({
    socketIoClient: undefined,
  }),
  computed: {
    queuedUploads() {
      return this.uploadsStore.queuedUploads;
    },
  },
  methods: {
    async connectSocketIoClient() {
      this.socketIoClient = new SocketIoService();
      this.socketIoClient.setupSocketConnection();
    },
  },
  watch: {
    async queuedUploads() {
      await this.uploadsStore.handleNextUpload();
    },
  },
});
</script>

<style>
html {
  overflow-y: auto;
  background-color: #121212;
}
</style>
