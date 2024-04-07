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
    <PrinterMaintenanceDialog />
    <BatchJsonCreateDialog />
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
