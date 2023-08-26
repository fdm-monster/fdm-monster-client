<template>
  <span>
    <v-overlay v-model="overlay" opacity="0.98" style="z-index: 7">
      <GridLoader :size="20" class="ma-auto" color="#a70015" />
      <br />

      <!-- Fade-in -->
      <!-- Slow scroll fade-out vtexts -->
      <div style="animation: fadeIn 0.75s">{{ overlayMessage }}</div>
    </v-overlay>
    <slot v-if="!overlay" />
  </span>
</template>
v
<script lang="ts" setup>
import { onBeforeMount, onUnmounted, ref } from "vue";
import GridLoader from "./components/Generic/Loaders/GridLoader.vue";
import { useAuthStore } from "./store/auth.store";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useSettingsStore } from "@/store/settings.store";
import { setSentryEnabled } from "@/utils/sentry.util";
import { useFeatureStore } from "@/store/features.store";
import { useProfileStore } from "@/store/profile.store";
import { useEventBus } from "@vueuse/core";
import { SocketIoService } from "@/shared/socketio.service";

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const featureStore = useFeatureStore();
const profileStore = useProfileStore();
const overlay = ref(false);
const overlayMessage = ref("");
const snackbar = useSnackbar();
const socketIoClient: SocketIoService = new SocketIoService();

function setOverlay(overlayEnabled: boolean, message: string = "") {
  if (!overlayEnabled) {
    overlayMessage.value = "";
  } else {
    overlayMessage.value = message;
  }
  overlay.value = overlayEnabled;
}

async function loadAppWithAuthentication() {
  try {
    authStore.loadTokens();
    await authStore.verifyLogin();
    await settingsStore.loadSettings();
    await featureStore.loadFeatures();
    await profileStore.getProfile();

    const enabled = settingsStore.serverSettings?.sentryDiagnosticsEnabled;
    setSentryEnabled(!!enabled);
  } catch (e) {
    console.log("Error when loading settings.", e);
    snackbar.openErrorMessage({
      title: "Error",
      fullSubtitle: "Error when verifying login and loading settings.",
      subtitle: "Error when verifying login.",
    });
  }

  await socketIoClient.setupSocketConnection();

  setOverlay(false);
}

const key = useEventBus("auth:login");
key.on(() => {
  setOverlay(true);
  loadAppWithAuthentication();
});

onUnmounted(() => {
  key.reset();
  if (socketIoClient) {
    socketIoClient.disconnect();
  }
});

onBeforeMount(async () => {
  setOverlay(true, "Loading spools");

  // If the route is wrong about login requirements, an error will be shown
  const loginRequired = await authStore.checkLoginRequired();
  if (!loginRequired) {
    return await loadAppWithAuthentication();
  }

  // Router will have tackled routing already
  if (!authStore.hasAuthToken) {
    return setOverlay(false);
  }

  if (authStore.hasAuthToken && authStore.isLoginExpired) {
    // What if refreshToken is not present or not valid?
    setOverlay(true, "Refreshing login");

    await authStore.verifyLogin();

    // Dont load app
    return;
  }

  await loadAppWithAuthentication();
});
</script>
<style>
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
