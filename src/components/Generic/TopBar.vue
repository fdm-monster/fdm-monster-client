<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title class="text-uppercase white--text">
      <span class="font-weight-light">FDM</span>
      <strong>Monster</strong>
    </v-toolbar-title>
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

    <v-btn class="ml-2" color="secondary" @click="logout()" v-if="authStore.loginRequired === true">
      <v-icon class="mr-2">logout</v-icon>
      Logout
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
import PrintJobsMenu from "@/components/Generic/PrintJobsMenu.vue";
import { useAuthStore } from "@/store/auth.store";
import { computed, onMounted } from "vue";
import { useProfileStore } from "@/store/profile.store";
import { useRouter } from "vue-router/composables";
import { routeToLogin } from "@/router/utils";

const profileStore = useProfileStore();
const authStore = useAuthStore();
const router = useRouter();
const items = [{ title: "Open Profile", icon: "person", path: "/settings/account" }];

const username = computed(() => {
  return profileStore.username;
});

async function logout() {
  authStore.logout();
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
