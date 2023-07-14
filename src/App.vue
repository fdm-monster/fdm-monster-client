<template>
  <v-app>
    <NavigationDrawer />
    <TopBar />

    <v-main>
      <router-view />
    </v-main>

    <AppSnackbars />
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
import AppSnackbars from "./components/Generic/Snackbars/AppSnackbars.vue";
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

interface Data {
  socketIoClient?: SocketIoService;
}

export default defineComponent({
  name: "AppView",
  components: {
    YamlImportExportDialog,
    TopBar,
    NavigationDrawer,
    AddOrUpdatePrinterDialog,
    AddOrUpdateFloorDialog,
    PrinterMaintenanceDialog,
    FileExplorerSideNav,
    AppSnackbars,
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
  async created() {
    await this.settingsStore.loadSettings();
    const enabled = this.settingsStore.serverSettings?.sentryDiagnosticsEnabled;
    setSentryEnabled(!!enabled);

    await this.featureStore.loadFeatures();
    await this.connectSocketIoClient();

    // Nice visual test for uploads
    // let i = 0;
    // let j = 0;
    // let interval: any;
    // // eslint-disable-next-line prefer-const
    // interval = setInterval(() => {
    //   i += 2;
    //   j += 3;
    //   this.snackbar.openProgressMessage("1", "file.gcode to YoParinter", i, i > 55);
    //   if (j > 10 && j < 80) {
    //     this.snackbar.openProgressMessage("2", "file2.gcode to Beast", i, i > 80);
    //   }
    //   this.snackbar.openProgressMessage("3", "file3.gcode to Beast", i, i > 80);
    //   this.snackbar.openProgressMessage("4", "file4.gcode to Beast", i, i > 80);
    //   if (j > 20) this.snackbar.openProgressMessage("5", "file5.gcode to Beast", i, i > 60);
    //   this.snackbar.openProgressMessage("6", "file6.gcode to Beast", i, i > 65);
    //   this.snackbar.openProgressMessage("7", "file7.gcode to Beast", i, i > 80);
    //
    //   if (i >= 110 && j > 115) {
    //     clearInterval(interval);
    //   }
    // }, 200);
  },
  errorCaptured(error) {
    this.snackbar.openErrorMessage({
      title: "An error occurred",
      subtitle: error.message.slice(0, 20) + "...",
    });
    // Check if still caught by Sentry
    // throw error;
  },
  async mounted() {},
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
