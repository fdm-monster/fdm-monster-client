<template>
  <span>
    <v-overlay
      v-model="overlay"
      class="align-center justify-center"
      opacity="0.98"
      style="z-index: 7"
    >
      <GridLoader :size="20" color="#a70015" />
    </v-overlay>
    <slot v-if="!overlay" />
  </span>
</template>
<script lang="ts" setup>
import { onBeforeMount, onUnmounted, ref } from "vue";
import GridLoader from "./components/Generic/Loaders/GridLoader.vue";
import { useAuthStore } from "./store/auth.store";
import { useRouter } from "vue-router/composables";
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
const overlay = ref(true);
const snackbar = useSnackbar();
const router = useRouter();
const socketIoClient: SocketIoService = new SocketIoService();

function setOverlay(overlayEnabled: boolean) {
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
  const loginRequired = await authStore.checkLoginRequired();

  // If the route is wrong about login requirements, an error will be shown
  if (!loginRequired) {
    console.log("No login required. Loading settings.");
    return await loadAppWithAuthentication();
  }

  // Router will have tackled routing already
  if (!authStore.isLoggedIn) {
    return setOverlay(false);
  }

  if (authStore.isLoggedIn && authStore.isLoginExpired) {
    try {
      await authStore.refreshTokens();
    } catch (e) {
      console.error("Error when refreshing login.");
      snackbar.openErrorMessage({
        title: "Login error",
        fullSubtitle: "Error when refreshing login.",
      });
      await router.push({ name: "Login" });
    }
  }

  await loadAppWithAuthentication();
});
</script>
