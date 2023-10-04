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
              :disabled="!authStore.registration"
              :loading="loading"
              class="pa-4"
              color="primary"
              large
              style="width: 50%"
              @click="gotoRegistration()"
            >
              Register {{ authStore.registration ? "" : "(not enabled)" }}
            </v-btn>
            <v-btn
              :loading="loading"
              class="pa-4"
              color="primary"
              large
              style="width: 50%"
              @click="login()"
            >
              Login
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
  await authStore.checkLoginRequired();
  if (!authStore.hasRefreshToken) {
    return;
  }

  const success = await authStore.verifyOrRefreshLoginOnce();
  if (success || authStore.loginRequired === false) {
    const routePath = route.query.redirect;

    if (!routePath) {
      console.debug("LoginView, no query param, redirecting to home");
      await router.push({ name: "Home" });
      return;
    } else {
      console.debug("LoginView, query param, redirecting to", routePath);
      await router.push({
        path: routePath as string,
      });
      return;
    }
  }
});

async function gotoRegistration() {
  return await router.push({ name: RouteNames.Registration });
}

async function login() {
  try {
    loading.value = true;
    await authStore.login(username.value, password.value);
    loading.value = false;
  } catch (e) {
    loading.value = false;
    if ((e as AxiosError)?.response?.status === 401) {
      errorMessage.value = "Invalid credentials";
      return;
    }

    snackbar.openErrorMessage({
      title: "Error logging in",
      subtitle: "Please test your connection and try again.",
    });

    return;
  }

  errorMessage.value = "";

  // Trigger AppLoader
  loginEvent.emit(true);

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
