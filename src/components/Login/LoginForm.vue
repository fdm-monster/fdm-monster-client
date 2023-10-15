<template>
  <v-container fill-height fluid>
    <v-layout align-content-center justify-center>
      <v-flex
        class="d-flex flex-column align-content-center"
        md4
        sm8
        style="max-width: 550px; margin-top: 10%"
        xs12
      >
        <div class="d-flex flex-column align-center">
          <v-img
            :src="require('@/assets/logo.png')"
            class="shrink mr-1 pt-3 ml-1"
            contain
            style="opacity: 0.85"
            width="150"
          ></v-img>

          <v-toolbar-title class="text-uppercase red--text">
            <strong>FDM&nbsp;</strong>
            <strong>Monster</strong>
          </v-toolbar-title>

          <v-toolbar-title class="mt-lg-6 mt-sm-5"> Login to your account</v-toolbar-title>
          <v-card-subtitle class="grey--text">
            Welcome back! Please enter your details
          </v-card-subtitle>
        </div>

        <v-card class="elevation-4 pa-4" style="border-radius: 10px">
          <v-card-text>
            <v-form>
              <label> Username </label>
              <v-text-field
                v-model="username"
                autofocus
                name="login"
                placeholder="Username"
                prepend-icon="person"
                type="text"
                @keyup.enter="formIsDisabled || login()"
              ></v-text-field>
              <v-text-field
                id="password"
                v-model="password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                name="password"
                password
                prepend-icon="lock"
                @click:append="showPassword = !showPassword"
                @keyup.enter="formIsDisabled || login()"
              ></v-text-field>
              <v-alert v-if="errorMessage" class="mt-6" color="error" dense outlined>
                {{ errorMessage }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              :loading="loading"
              class="pa-4"
              color="primary"
              large
              style="width: 100%"
              @click="login()"
            >
              Login
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn
              :disabled="!authStore.registration"
              class="pa-4"
              large
              style="width: 100%"
              @click="gotoRegistration()"
            >
              Register new account {{ authStore.registration ? "" : "(not enabled)" }}
              <v-icon right>arrow_right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/store/auth.store";
import { useRoute, useRouter } from "vue-router/composables";
import { useEventBus } from "@vueuse/core";
import { useSnackbar } from "@/shared/snackbar.composable";
import { AxiosError } from "axios";
import { RouteNames } from "@/router/route-names";
import { AUTH_ERROR_REASON, convertAuthErrorReason } from "@/shared/auth.constants";

const authStore = useAuthStore();
const errorMessage = ref("");
const username = ref("");
const showPassword = ref(false);
const password = ref("");
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loginEvent = useEventBus("auth:login");
const snackbar = useSnackbar();

const formIsDisabled = computed(() => {
  return (username.value ?? "")?.length < 3 || (password.value ?? "").length < 3;
});

onMounted(async () => {
  authStore.loadTokens();
  await authStore.checkAuthenticationRequirements();
  if (authStore.loginRequired === false) {
    console.debug("LoginView, no login required, redirecting to", route.query.redirect, "or home");
    return await routeToRedirect();
  }
  if (!authStore.hasRefreshToken) {
    return;
  }

  // Check if login is already valid, if so route away safely
  const success = await authStore.verifyOrRefreshLoginOnceOrLogout();
  if (success) {
    await routeToRedirect();
  }
});

async function gotoRegistration() {
  return await router.push({ name: RouteNames.Registration });
}

async function login() {
  try {
    loading.value = true;
    await authStore.login(username.value, password.value);
    password.value = "";
    loading.value = false;
  } catch (e) {
    loading.value = false;
    if ((e as AxiosError)?.response?.status === 401) {
      password.value = "";

      const reasonCode: keyof typeof AUTH_ERROR_REASON = ((e as AxiosError)?.response?.data as any)
        ?.reasonCode;
      const convertedReason = convertAuthErrorReason(reasonCode);
      if (reasonCode === AUTH_ERROR_REASON.AccountNotVerified) {
        snackbar.error(
          convertedReason,
          "Please ask your administrator to verify your account and try again."
        );
      } else if (reasonCode === AUTH_ERROR_REASON.PasswordChangeRequired) {
        snackbar.error(
          convertedReason,
          "Your password needs to be changed. This feature is sadly not finished"
        );
      }

      errorMessage.value = convertedReason;
      return;
    }

    snackbar.openErrorMessage({
      title: "Error logging in",
      subtitle: "Please test your connection and try again.",
    });
    errorMessage.value = "Error logging in - status code " + (e as AxiosError)?.response?.status;
    password.value = "";

    return;
  }

  errorMessage.value = "";

  // Trigger AppLoader
  loginEvent.emit(true);

  return await routeToRedirect();
}

async function routeToRedirect() {
  const routePath = route.query.redirect;
  if (!routePath) {
    console.debug("[LoginForm] Redirecting to home");
    await router.push({ name: RouteNames.Home });
    return;
  } else {
    console.debug("[LoginForm] Redirecting to ", routePath);
    await router.push({
      path: routePath as string,
    });
    return;
  }
}
</script>
