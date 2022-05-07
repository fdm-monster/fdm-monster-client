<template>
  <v-navigation-drawer app class="video-background-page" dark permanent rail>
    <v-list-item class="video-background-page">
      <v-list-item-title class="text-h5">
        <div class="d-flex align-center">
          <v-img
              alt="FDM Monster Logo"
              class="shrink mr-2 pt-2"
              contain
              src="/img/icons/android-chrome-192x192.png"
              transition="scale-transition"
              width="40"
          />
        </div>
      </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
          v-for="([icon, title, path], i) in items"
          :key="i"
          :prepend-icon="icon"
          :title="title"
          :to="path"
          router-link
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
export default defineComponent({
  data: () => ({
    items: [
      ["home", "Devices", "/"],
      ["printer", "Printers", "/printers"],
      ["settings", "Settings", "/settings"],
      ["history", "PrintScheduling", "/scheduling"],
      ["contact_support", "About", "/about"],
    ],
    routes: computed(() => {
      return useRouter().options.routes.filter(
          (route) => !route.meta || !route.meta.hidden
      );
    })
  })
});
</script>

<style>
/*https://mdbootstrap.com/docs/vue/css/background-image/*/
.video-background-page {
  background: -moz-linear-gradient(
      45deg,
      rgba(18, 18, 18, 1),
      rgba(155, 5, 5, 1) 100%
  );
  background: -webkit-linear-gradient(
      45deg,
      rgba(18, 18, 18, 1),
      rgba(155, 5, 5, 1) 100%
  );
  background: linear-gradient(
      45deg,
      rgba(18, 18, 18, 1),
      rgba(155, 5, 5, 1) 100%
  );
}

.video-background-page .view video {
  top: 0 !important;
  left: 0 !important;
  transform: none !important;
  height: calc(100vh - 60px);
}
</style>
