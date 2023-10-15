<template>
  <span>
    <v-overlay v-model="overlay" opacity="0.98" style="z-index: 7">
      <GridLoader v-if="loading" :size="20" class="ma-auto" color="#a70015" />
      <br />

      <div v-if="errorCaught">
        <h1>FDM Monster Server Error</h1>
        <p>Did not expect this answer from the server. Please check your configuration and logs.</p>
        <v-sheet class="pa-4 rounded" color="grey darken-2" width="80%">
          Details:
          <div class="mt-2 mb-2">{{ JSON.stringify(errorCaught, null, 4) }}</div>
          <br />
          <v-btn class="mb-2" color="secondary" @click="copyError()">
            <v-icon class="mr-2">content_copy</v-icon>
            Copy error details
          </v-btn>
          <br />
          <v-btn color="primary mb-2" @click="reloadPage()">
            <v-icon class="mr-2">refresh</v-icon>reload the page
          </v-btn>
          <br />
          <v-btn
            color="darken-2 mb-2"
            href="https://docs.fdm-monster.net"
            style="color: white"
            target="_blank"
          >
            <v-icon class="mr-2">menu_book</v-icon>
            view documentation
          </v-btn>
          <br />
          <v-btn
            color="purple darken-4"
            href="https://discord.gg/mwA8uP8CMc"
            style="color: white"
            target="_blank"
          >
            <v-icon class="mr-2">chat</v-icon>
            join our Discord
          </v-btn>
        </v-sheet>

        <img
          class="justify-center align-center align-content-center rounded-pill mt-8 ma-4"
          src="/img/OIG.JYDC2RaWdz7g9.jpg"
          style="opacity: 0.9"
          width="400"
        />
      </div>

      <!-- Fade-in -->
      <!-- Slow scroll fade-out vtexts -->
      <div v-if="loading" style="animation: fadeIn 0.75s">{{ overlayMessage }}</div>
    </v-overlay>
    <slot v-if="!overlay" />
  </span>
</template>

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
import { useRouter } from "vue-router/composables";
import { sleep } from "@/utils/time.utils";
import { RouteNames } from "@/router/route-names";
import { AppService } from "@/backend/app.service";
import { AxiosError } from "axios";

const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const featureStore = useFeatureStore();
const profileStore = useProfileStore();
const overlay = ref(false);
const router = useRouter();
const overlayMessage = ref("");
const loading = ref(true);
const errorCaught = ref(null);
const snackbar = useSnackbar();
const socketIoClient: SocketIoService = new SocketIoService();

function reloadPage() {
  window.location.reload();
}

function copyError() {
  navigator.clipboard.writeText(JSON.stringify(errorCaught.value));
  snackbar.openInfoMessage({
    title: "Copied",
    subtitle: "Error copied to clipboard",
  });
}

function setOverlay(overlayEnabled: boolean, message: string = "") {
  if (!overlayEnabled) {
    overlayMessage.value = "";
  } else {
    overlayMessage.value = message;
  }
  overlay.value = overlayEnabled;
}

async function loadAppWithAuthenticationReady() {
  try {
    await settingsStore.loadSettings();
    await featureStore.loadFeatures();
    await profileStore.getProfile();

    const enabled = settingsStore.serverSettings?.sentryDiagnosticsEnabled;
    setSentryEnabled(!!enabled);
  } catch (e) {
    console.log("Error when loading settings.", e);
    snackbar.openErrorMessage({
      title: "Error",
      subtitle: "Error when loading settings, features and/or profile.",
    });
  }

  await socketIoClient.setupSocketConnection();

  setOverlay(false);
}

// In use (shared/http-client.ts)
const authPermissionDeniedKey = useEventBus("auth:permission-denied");
authPermissionDeniedKey.on(async (event) => {
  console.log("[AppLoader] Permission denied, going to permission denied page");
  setOverlay(true, "Permission denied");
  await router.push({
    name: RouteNames.PermissionDenied,
    query: {
      roles: event?.roles,
      page: router.currentRoute.name,
      permissions: event?.permissions,
      error: event?.error,
      url: event?.url,
    },
  });
  setOverlay(false);
});

// Currently unused
const authFailKey = useEventBus("auth:failure");
authFailKey.on(async (event: any) => {
  console.debug(
    `[AppLoader] Event received: 'auth:failure', going back to login, context: ${event}`
  );
  setOverlay(true, "Authentication failed, going back to login");

  if (router.currentRoute.name !== RouteNames.Login) {
    await router.push({ name: RouteNames.Login });
  }
  setOverlay(false);
});

// In use (components/Login/LoginForm.vue)
const loginEventKey = useEventBus("auth:login");
loginEventKey.on(async () => {
  console.debug("[AppLoader] Event received: 'auth:login', loading app");
  setOverlay(true, "Loading app");
  await loadAppWithAuthenticationReady();
});

onUnmounted(() => {
  if (socketIoClient) {
    socketIoClient.disconnect();
  }
});

onBeforeMount(async () => {
  loading.value = true;
  setOverlay(true, "Loading spools");

  try {
    await AppService.test();
    // Nice test for error handling
    // throw new Error("test");
  } catch (e) {
    loading.value = false;
    errorCaught.value = e;
    return;
  }

  // If the route is wrong about login requirements, an error will be shown
  const { loginRequired, wizardState } = await authStore.checkAuthenticationRequirements();
  if (!wizardState.wizardCompleted) {
    console.debug("[AppLoader] Wizard not completed, going to wizard");
    await authStore.logout(false);
    if (router.currentRoute.name !== RouteNames.FirstTimeSetup) {
      await router.replace({ name: RouteNames.FirstTimeSetup });
    }
    setOverlay(false);
    return;
  }

  // Login is not required, load app directly
  if (!loginRequired) {
    console.debug("[AppLoader] Login not required, loading app");
    return await loadAppWithAuthenticationReady();
  }

  // Router will have tackled routing already
  console.debug("[AppLoader] Checking if tokens are present");
  if (!authStore.hasAuthToken && !authStore.hasRefreshToken) {
    console.debug("[AppLoader] No tokens present, hiding overlay as router will have handled it");
    return setOverlay(false);
  }

  // What if refreshToken is not present or not valid?
  setOverlay(true, "Refreshing login");
  console.debug("[AppLoader] Verifying or refreshing login once");
  try {
    const refreshSuccess = await authStore.verifyOrRefreshLoginOnceOrLogout();
    if (!refreshSuccess) {
      console.debug("[AppLoader] No success refreshing");
      setOverlay(true, "Login expired, going back to login");

      await sleep(500);
      if (router.currentRoute.name !== RouteNames.Login) {
        await router.push({ name: RouteNames.Login });
      }
      setOverlay(false);
      // Dont load app as it will be redirected to login
      return;
    }
  } catch (e) {
    console.log("[AppLoader] Error when refreshing login", e);
    loading.value = false;
    errorCaught.value = (e as AxiosError).message;
    return;
  }

  console.debug("[AppLoader] Loading app");
  await loadAppWithAuthenticationReady();
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
