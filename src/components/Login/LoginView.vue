<template>
  <v-container fill-height fluid>
    <v-layout align-center justify-center>
      <LoginForm />
    </v-layout>
  </v-container>
</template>

<script lang="ts" setup>
import { useAuthStore } from "@/store/auth.store";
import { onMounted } from "vue";
import LoginForm from "./LoginForm.vue";
import { useRoute, useRouter } from "vue-router/composables";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  authStore.loadTokens();
  await authStore.checkLoginRequired();
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
</script>
<style scoped>
.grid-bg-img {
  position: fixed;
  height: 100vh;
  top: 50vh;
  width: 600%;
  left: -250%;
  filter: grayscale(100%);
}
</style>
