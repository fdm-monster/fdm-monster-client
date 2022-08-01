<template>
  <v-app>
    <NavigationDrawer />
    <FileExplorerSideNav />
    <TopBar />

    <v-main>
      <router-view />
    </v-main>
  </v-app>

  <UpdatePrinterDialog />
  <CreatePrinterGroupDialog />
  <CreatePrinterDialog />
  <BatchJsonCreateDialog />
</template>

<script lang="ts">
import { provideAppConstants } from "@/shared/app.constants";
import { useServerSettingsStore } from "@/stores/server-settings";
import type SseClient from "@/plugins/sse-client/sse-client";
import { SseService } from "@/backend/sse.service";

export default defineComponent({
  setup: () => {
    provideAppConstants();
    return {
      sseClient: ref<SseClient>(),
      printersStore: usePrintersStore(),
      printerGroupsStore: usePrinterGroupsStore(),
    };
  },
  methods: {
    async connectSseClient() {
      this.sseClient = this.$sse.create(this.$sse.$defaultConfig);
      this.sseClient.on("message", (msg: any) => SseService.onSseMessage(msg));
      this.sseClient.on("error", (err: any) =>
        console.error("Failed to parse or lost connection:", err)
      );
      this.sseClient
        .connect()
        .catch((err: any) =>
          console.error("Failed make initial connection:", err)
        );
    },
  },
  async mounted() {
    await useServerSettingsStore().loadServerSettings();
    await this.connectSseClient();

    this.printerGroupsStore.setCreateGroupDialogOpened(true);
  },
});
</script>

<style>
@import "@/assets/base.css";
</style>
