<template>
  <v-container fill-height fluid>
    <v-layout align-content-center justify-center>
      <v-flex
        class="d-flex flex-column align-content-center"
        md4
        sm8
        style="max-width: 450px; margin-top: 10%"
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

          <v-toolbar-title class="mt-lg-6 mt-sm-5"> Register new account</v-toolbar-title>
          <v-card-subtitle class="grey--text">
            Welcome! Please register your guest account
          </v-card-subtitle>
        </div>

        <v-card class="elevation-4 pa-4" style="border-radius: 10px">
          <v-card-text>
            <v-form>
              <label> Username </label>
              <v-text-field
                v-model="username"
                :rules="[(v) => !!v || 'Username is required']"
                autofocus
                name="login"
                label="Username"
                prepend-icon="person"
                type="text"
              ></v-text-field>
              <v-text-field
                id="password"
                v-model="password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                name="password"
                :rules="[
                  (v) => !!v || 'Password is required',
                  (v) => (!!v && v?.length >= 8) || 'Password must be of length 8 or greater',
                ]"
                password
                prepend-icon="lock"
                @click:append="showPassword = !showPassword"
              ></v-text-field>
              <v-text-field
                id="password"
                v-model="password2"
                :append-icon="showPassword2 ? 'visibility' : 'visibility_off'"
                :type="showPassword2 ? 'text' : 'password'"
                :rules="[
                  (v) => !!v || 'Repeated password is required',
                  (v) => v === password || 'Passwords are not equal',
                ]"
                label="Repeated Password"
                name="password"
                password
                prepend-icon="lock"
                @click:append="showPassword2 = !showPassword2"
                @keyup.enter="formIsDisabled || registerAccount()"
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
              @click="registerAccount()"
            >
              Register account
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn :loading="loading" style="width: 100%" class="pa-4" large @click="gotoLogin()">
              <v-icon class="mr-2">arrow_left</v-icon>Back to Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts" setup>
import { AxiosError } from "axios";
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "vue-router/composables";
import { useSnackbar } from "@/shared/snackbar.composable";
import { AuthService } from "@/backend/auth.service";
import { RouteNames } from "@/router/route-names";

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref("");
const username = ref("");
const showPassword = ref(false);
const showPassword2 = ref(false);
const password = ref("");
const password2 = ref("");
const loading = ref(false);
const snackbar = useSnackbar();

async function gotoLogin() {
  return await router.push({ name: RouteNames.Login });
}

const formIsDisabled = computed(() => {
  return (
    (username.value ?? "")?.length < 3 ||
    (password.value ?? "").length < 3 ||
    password.value != password2.value
  );
});

onMounted(async () => {
  await authStore.logout();
  await authStore.checkAuthenticationRequirements();
  if (!authStore.registration) {
    snackbar.info("Registration is disabled, please contact your administrator");
    await router.push({
      name: RouteNames.Login,
    });
  }
});

async function registerAccount() {
  try {
    loading.value = true;
    await AuthService.registerAccount(username.value, password.value);
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

  snackbar.info("Account created, please login");
  await gotoLogin();
}
</script>
