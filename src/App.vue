<template>
  <v-app>
    <AppInfoSnackbar />
    <AppErrorSnackbar />
    <AppProgressSnackbar />

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
    <AddOrUpdateCameraStreamDialog />
    <AddOrUpdateFloorDialog />
    <CreateUserDialog />
    <GridSettingsDialog />
    <PrinterMaintenanceDialog />
    <OctoFarmImportDialog />
    <YamlImportExportDialog />
    <FileExplorerSideNav />
    <BatchReprintDialog />
    <PrinterControlDialog />
  </v-app>
</template>

<script lang="ts" setup>
import { uploadProgressTest } from "./utils/test.util";
import { useAuthStore } from "./store/auth.store";
import AppLoader from "./AppLoader.vue";
import { useUploadsStore } from "@/store/uploads.store";
import { onMounted, watch } from "vue";
import AddOrUpdatePrinterDialog from "@/components/Generic/Dialogs/AddOrUpdatePrinterDialog.vue";
import AddOrUpdateCameraStreamDialog from "@/components/Generic/Dialogs/AddOrUpdateCameraStreamDialog.vue";
import AddOrUpdateFloorDialog from "@/components/Generic/Dialogs/AddOrUpdateFloorDialog.vue";
import PrinterMaintenanceDialog from "@/components/Generic/Dialogs/PrinterMaintenanceDialog.vue";
import OctoFarmImportDialog from "@/components/Generic/Dialogs/OctoFarmImportDialog.vue";
import YamlImportExportDialog from "@/components/Generic/Dialogs/YamlImportExportDialog.vue";
import FileExplorerSideNav from "@/components/Generic/FileExplorerSideNav.vue";
import BatchReprintDialog from "@/components/Generic/Dialogs/BatchReprintDialog.vue";
import PrinterControlDialog from "@/components/Generic/Dialogs/PrinterControlDialog.vue";
import TopBar from "@/components/TopBar.vue";
import NavigationDrawer from "@/components/NavigationBar.vue";
import AppProgressSnackbar from "@/components/Generic/Snackbars/AppProgressSnackbar.vue";
import AppErrorSnackbar from "@/components/Generic/Snackbars/AppErrorSnackbar.vue";
import AppInfoSnackbar from "@/components/Generic/Snackbars/AppInfoSnackbar.vue";
import CreateUserDialog from "@/components/Generic/Dialogs/CreateUserDialog.vue";
import GridSettingsDialog from "@/components/Generic/Dialogs/GridSettingsDialog.vue";

const uploadsStore = useUploadsStore();
const authStore = useAuthStore();

const queuedUploads = uploadsStore.queuedUploads;

watch(queuedUploads, async () => {
  await uploadsStore.handleNextUpload();
});

onMounted(() => {
  console.debug(
    `App.vue mounted. Logged in: ${authStore.hasAuthToken}, Expired: ${authStore.isLoginExpired}`
  );
  uploadProgressTest(false);
});
</script>

<style>
html {
  overflow-y: auto;
  background-color: #121212;
}
</style>
