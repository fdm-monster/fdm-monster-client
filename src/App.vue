<template>
  <v-app>
    <NavigationDrawer />
    <TopBar />

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">

import TopBar from '@/components/TopBar.vue';
import NavigationDrawer from '@/components/NavigationDrawer.vue';

</script>

<style>
@import '@/assets/base.css';
</style>
