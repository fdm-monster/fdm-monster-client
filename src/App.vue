<template>
  <v-app>
    <NavigationDrawer />
    <TopBar />

    <v-main>
      <ErrorAlert>
        <router-view />
      </ErrorAlert>
    </v-main>

    <UpdatePrinterDialog />
    <CreatePrinterDialog />
    <CreatePrinterFloorDialog />
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
import ErrorAlert from "@/components/Generic/AlertStack.vue";
import UpdatePrinterDialog from "@/components/Generic/Dialogs/UpdatePrinterDialog.vue";
import FileExplorerSideNav from "./components/Generic/FileExplorerSideNav.vue";
import CreatePrinterDialog from "@/components/Generic/Dialogs/CreatePrinterDialog.vue";
import CreatePrinterFloorDialog from "@/components/Generic/Dialogs/CreatePrinterFloorDialog.vue";
import PrinterMaintenanceDialog from "@/components/Generic/Dialogs/PrinterMaintenanceDialog.vue";
import { useUploadsStore } from "@/store/uploads.store";
import { usePrintersStore } from "@/store/printers.store";
import { useServerSettingsStore } from "@/store/server-settings.store";
import { SocketIoService } from "./shared/socketio.service";
import { useDialogsStore } from "@/store/dialog.store";
import BatchJsonCreateDialog from "@/components/Generic/Dialogs/BatchJsonCreateDialog.vue";
import YamlImportExportDialog from "@/components/Generic/Dialogs/YamlImportExportDialog.vue";
import { useFeatureStore } from "./store/features.store";

interface Data {
  socketIoClient?: SocketIoService;
}

export default defineComponent({
  name: "AppView",
  components: {
    YamlImportExportDialog,
    TopBar,
    NavigationDrawer,
    UpdatePrinterDialog,
    CreatePrinterDialog,
    CreatePrinterFloorDialog,
    PrinterMaintenanceDialog,
    FileExplorerSideNav,
    ErrorAlert,
    BatchJsonCreateDialog,
  },
  setup: () => {
    return {
      uploadsStore: useUploadsStore(),
      printersStore: usePrintersStore(),
      serverSettingsStore: useServerSettingsStore(),
      featureStore: useFeatureStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  async created() {
    this.uploadsStore._injectEventBus(this.$bus);

    await this.serverSettingsStore.loadServerSettings();
    await this.featureStore.loadFeatures();
    await this.connectSocketIoClient();
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
      this.socketIoClient.setupSocketConnection(this.$bus);
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
