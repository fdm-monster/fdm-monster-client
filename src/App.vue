<template>
  <v-app>
    <NavigationDrawer/>
    <TopBar/>

    <v-main>
      <router-view/>
    </v-main>

<!--    <UpdatePrinterDialog />-->
<!--    <CreatePrinterDialog />-->
<!--    <CreatePrinterGroupDialog />-->
    <FileExplorerSideNav />
  </v-app>
</template>

<script lang="ts" setup>

import TopBar from '@/components/TopBar.vue';
import NavigationDrawer from '@/components/NavigationDrawer.vue';
import {provideAppConstants} from "@/constants/app.constants";

provideAppConstants();

</script>

<style>
@import '@/assets/base.css';
</style>
