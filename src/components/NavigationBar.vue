<template>
  <v-navigation-drawer mini-variant app :permanent="true">
    <v-list-item class="px-2">
      <v-list-item-content>
        <v-list-item-title class="text-h5">
          <div class="d-flex align-center">
            <v-img
              :src="require('@/assets/logo.png')"
              alt="FDM Monster Logo"
              class="shrink mr-1 pt-3 ml-1"
              contain
              width="40"
            />
          </div>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item v-for="([icon, title, path], i) in items" :key="i" :to="path" link router-link>
        <v-list-item-icon>
          <v-icon>{{ icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
const items = [
  ["home", "Devices", "/"],
  ["printer", "Printers", "/printers"],
  ["camera_alt", "CameraGridView", "/cameras"],
  ["timeline", "PrintStatistics", "/statistics"],
  ["settings", "Settings", "/settings"],
  ["contact_support", "About", "/about"],
];
</script>

<style>
.gradient-bg {
  background: -moz-linear-gradient(45deg, rgba(18, 18, 18, 1), rgba(155, 5, 5, 1) 100%);
  background: -webkit-linear-gradient(45deg, rgba(18, 18, 18, 1), rgba(155, 5, 5, 1) 100%);
  background: linear-gradient(45deg, rgba(18, 18, 18, 1), rgba(155, 5, 5, 0.1) 50%);
}
</style>
