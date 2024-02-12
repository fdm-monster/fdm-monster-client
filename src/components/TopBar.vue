<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title class="text-uppercase white--text">
      <span class="font-weight-light">FDM</span>
      <strong>Monster</strong>
    </v-toolbar-title>

    <v-spacer v-if="isDemoMode" />
    <h2 v-if="isDemoMode" class="text-uppercase text--white">DEMO MODE</h2>
    <v-spacer></v-spacer>

    <PrintJobsMenu />

    <v-menu
      v-if="authStore.hasAuthToken && !authStore.isLoginExpired"
      :close-on-content-click="false"
      :nudge-width="200"
      bottom
      offset-x
      offset-y
      open-on-hover
      right
      transition="slide-y-transition"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn class="ml-2" color="secondary" dark nuxt v-bind="attrs" v-on="on">
          <v-icon class="mr-2">person</v-icon>
          {{ username }}
        </v-btn>
      </template>

      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" :to="item.path" link>
          <v-list-item-title>
            <v-list-item-avatar>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-avatar>
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <span v-if="isDevEnv && expiry" class="ml-2"> AuthExp {{ expiry }} </span>

    <span v-if="isDevEnv" class="ml-2">
      <small v-if="!socketState">No Socket</small>
      <small v-else>
        Socket {{ socketState.id }} A:{{ socketState.active ? 1 : 0 }} C:{{
          socketState.connected ? 1 : 0
        }}
        R:{{ socketState.recovered ? 1 : 0 }}
      </small>
    </span>

    <v-btn v-if="authStore.loginRequired === true" class="ml-2" color="secondary" @click="logout()">
      <v-icon class="mr-2">logout</v-icon>
      Logout
    </v-btn>
    <v-btn icon @click="showHelp = true">
      <v-icon>help</v-icon>
    </v-btn>
    <v-dialog
      v-model="showHelp"
      eager
      fullscreen
      style="background-color: white"
      transition="dialog-bottom-transition"
      width="90%"
    >
      <v-btn @click="showHelp = false"
        >Close Help
        <v-icon>close</v-icon>
      </v-btn>
      <v-card height="100%" width="100%">
        <v-toolbar color="primary">
          <v-icon class="mr-2">help</v-icon>
          Showing help from docs.fdm-monster.net
        </v-toolbar>

        <iframe
          height="100%"
          src="https://docs.fdm-monster.net"
          style="background-color: white"
          width="100%"
        />
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script lang="ts" setup>
import PrintJobsMenu from "@/components/Generic/PrintJobsMenu.vue";
import { useAuthStore } from "@/store/auth.store";
import { computed, ref } from "vue";
import { useProfileStore } from "@/store/profile.store";
import { useRouter } from "vue-router/composables";
import { routeToLogin } from "@/router/utils";
import { useIntervalFn } from "@vueuse/core";
import { isDevEnv, isProdEnv } from "@/shared/app.constants";
import { socketIoClient } from "@/store/connection.store";

const profileStore = useProfileStore();
const authStore = useAuthStore();
const router = useRouter();
const items = [{ title: "Open Profile", icon: "person", path: "/settings/account" }];

const showHelp = ref(false);

const now = ref(Date.now());
if (isDevEnv) {
  useIntervalFn(() => {
    now.value = Date.now();
  }, 1000);
}

const expiry = computed(() => {
  if (isProdEnv) {
    return "";
  }
  if (!authStore.tokenClaims?.exp) {
    return "";
  }
  const diffValue = authStore.tokenClaims.exp - now.value / 1000;
  return `${Math.round(diffValue)}s`;
});

const socketState = computed(() => {
  return socketIoClient.socketState();
});

const username = computed(() => {
  return profileStore.username;
});

const isDemoMode = computed(() => {
  return authStore.isDemoMode;
});

async function logout() {
  await authStore.logout(true);
  await routeToLogin(router);
}
</script>

<style lang="scss">
.border-time {
  border: 1px solid white;

  * {
    border: none;
  }
}
</style>
