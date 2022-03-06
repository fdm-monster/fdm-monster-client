<template>
  <v-navigation-drawer app class="video-background-page" dark permanent rail>
    <v-list-item class="">

      <v-list-item-title class="text-h5">
        <div class="d-flex align-center">
          <v-img
              alt="Vuetify Logo"
              class="shrink mr-2 pt-3"
              contain
              src="./assets/logo.svg"
              transition="scale-transition"
              width="40"
          />
        </div>
      </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item v-for="([icon, title, path], i) in items"
                   :key="i"
                   :prepend-icon="icon"
                   :title="title"
                   :to="path"
                   router-link>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import router from "@/router";

const drawer = true;

const items = [
  ["home", "Devices", "/"],
  ["printer", "Printers", "/printers"],
  ["settings", "Settings", "/settings"],
  ["history", "PrintScheduling", "/scheduling"],
  ["contact_support", "About", "/about"]
]

let routes = computed(() => {
  return router.options.routes.filter(
      (route) => !route.meta || !route.meta.hidden
  );
});

</script>

<style>
/*https://mdbootstrap.com/docs/vue/css/background-image/*/
.video-background-page {
  background: -moz-linear-gradient(45deg, rgba(46, 49, 146, 1), rgba(155, 5, 5, 1) 100%);
  background: -webkit-linear-gradient(45deg, rgba(46, 49, 146, 1), rgba(155, 5, 5, 1) 100%);
  background: linear-gradient(45deg, rgba(18, 18, 18, 1), rgba(155, 5, 5, 1) 100%);
}

.video-background-page .view video {
  top: 0 !important;
  left: 0 !important;
  transform: none !important;
  height: calc(100vh - 60px);
}
</style>
