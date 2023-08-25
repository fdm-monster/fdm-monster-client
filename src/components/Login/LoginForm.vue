<template>
  <v-container fill-height fluid>
    <v-layout align-center justify-center>
      <v-flex md4 sm8 xs12>
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>
              <v-icon>security</v-icon>
              Authorization required
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="username"
                :rules="['required', 'min:4', 'max:20']"
                autofocus
                label="Username"
                name="login"
                prepend-icon="person"
                type="text"
                @keyup.enter="formIsDisabled || login()"
              ></v-text-field>
              <v-text-field
                id="password"
                v-model="password"
                :rules="['required', 'min:8', 'max:20']"
                label="Password"
                name="password"
                password
                prepend-icon="lock"
                type="password"
                @keyup.enter="formIsDisabled || login()"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <!--            <v-btn color="primary" disabled to="/">Register</v-btn>-->
            <v-spacer></v-spacer>
            <v-btn :disabled="formIsDisabled" color="primary" @click="login()"> Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/store/auth.store";
import { useRoute, useRouter } from "vue-router/composables";
import { useEventBus } from "@vueuse/core";
import { useSnackbar } from "@/shared/snackbar.composable";

const authStore = useAuthStore();
const username = ref("");
const password = ref("");
const router = useRouter();
const route = useRoute();
const loginEvent = useEventBus("auth:login");
const snackbar = useSnackbar();

const formIsDisabled = computed(() => {
  return (username.value ?? "")?.length < 3 || (password.value ?? "").length < 3;
});

async function login() {
  try {
    await authStore.login(username.value, password.value);
  } catch (e) {
    snackbar.openErrorMessage({
      title: "Could not log you in",
    });
    return;
  }

  loginEvent.emit(true);

  const routePath = route.query.redirect;
  if (!routePath) {
    console.debug("[LoginForm] Redirecting to home");
    await router.push({ name: "Home" });
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
