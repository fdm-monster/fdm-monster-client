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

    const testedUrls = [
      "http://minipi:1234",
      "http://minipi",
      "https://pi.local/somepath",
      "https://pi.local/somepath/",
      "rack12.local",
      "rack12.local:8080",
      "octopi.local",
      "https://octopi.local",
      "https://octopi.local:8000",
      "http://minipi:80",
      "minipi:1234",
      "minipi",
      "http://localhost:1234",
      "localhost:1234",
      "localhost",
      "127.0.0.1",
      "127.0.0.2",
      "192.168.178.2",
      "https://my.printer.com",
      "my.printer.com",
      "asd",
      "my.printer.com ", // space
      "asd.",
      "ftp://my.printer.com",
      "http://127",
      "http://localhost:wxyz/",
      "http://localhost:wxyz",
    ];
    for (const testedUrl of testedUrls) {
      console.log(
        `Testing ${testedUrl}`,
        isURL(testedUrl?.trimEnd(), {
          protocols: ["http", "https"],
          require_tld: false,
          require_protocol: false,
          require_host: true,
          require_port: false,
          require_valid_protocol: true,
          allow_underscores: true,
          allow_trailing_dot: false,
          allow_protocol_relative_urls: false,
          allow_fragments: false,
          allow_query_components: false,
          validate_length: true,
        })
      );
    }
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
