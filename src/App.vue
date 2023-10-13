<template>
  <v-app>
    <AppInfoSnackbar />
    <AppErrorSnackbar />
    <AppProgressSnackbar />
    <AlertErrorDialog />

    <NavigationDrawer
      v-if="(authStore.hasAuthToken && !authStore.isLoginExpired) || !authStore.loginRequired"
    />
    <TopBar
      v-if="(authStore.hasAuthToken && !authStore.isLoginExpired) || !authStore.loginRequired"
    />

    <AppLoader>
      <v-main>
        <router-view />
      </v-main>
    </AppLoader>

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
import TopBar from "@/components/TopBar.vue";
import FileExplorerSideNav from "./components/Generic/FileExplorerSideNav.vue";
import AddOrUpdatePrinterDialog from "./components/Generic/Dialogs/AddOrUpdatePrinterDialog.vue";
import AddOrUpdateFloorDialog from "./components/Generic/Dialogs/AddOrUpdateFloorDialog.vue";
import PrinterMaintenanceDialog from "@/components/Generic/Dialogs/PrinterMaintenanceDialog.vue";
import { useUploadsStore } from "@/store/uploads.store";
import { usePrinterStore } from "./store/printer.store";
import { useSettingsStore } from "./store/settings.store";
import { useDialogsStore } from "@/store/dialog.store";
import BatchJsonCreateDialog from "@/components/Generic/Dialogs/BatchJsonCreateDialog.vue";
import YamlImportExportDialog from "@/components/Generic/Dialogs/YamlImportExportDialog.vue";
import { useFeatureStore } from "./store/features.store";
import { useSnackbar } from "./shared/snackbar.composable";
import AppProgressSnackbar from "./components/Generic/Snackbars/AppProgressSnackbar.vue";
import AlertErrorDialog from "./components/Generic/Snackbars/AlertErrorDialog.vue";
import AppErrorSnackbar from "./components/Generic/Snackbars/AppErrorSnackbar.vue";
import AppInfoSnackbar from "./components/Generic/Snackbars/AppInfoSnackbar.vue";
import { uploadProgressTest } from "./utils/test.util";
import { useAuthStore } from "./store/auth.store";
import AppLoader from "./AppLoader.vue";

interface Data {}

export default defineComponent({
  name: "AppView",
  components: {
    AppInfoSnackbar,
    AppErrorSnackbar,
    AlertErrorDialog,
    AppProgressSnackbar,
    AppLoader,
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
      authStore: useAuthStore(),
    };
  },
  async mounted() {
    console.debug(
      `App.vue mounted. Logged in: ${this.authStore.hasAuthToken}, Expired: ${this.authStore.isLoginExpired}`
    );

    uploadProgressTest(false);
  },
  beforeDestroy() {},
  props: {},
  data: (): Data => ({
    socketIoClient: undefined,
  }),
  computed: {
    queuedUploads() {
      return this.uploadsStore.queuedUploads;
    },
  },
  methods: {},
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
