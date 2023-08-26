<template>
  <v-container fill-height fluid>
    <v-app-bar app color="secondary" dark>
      <v-toolbar-title class="text-uppercase white--text">
        <span class="font-weight-light">FDM</span>
        <strong>Monster</strong>
      </v-toolbar-title>
    </v-app-bar>

    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.06"
    />

    <v-layout align-center justify-center>
      You do not have permission to access this page. Page: <strong>FloorSettings</strong>

      The following permission is required:
      <strong>Server.FakePermission.Read</strong>
    </v-layout>
  </v-container>
</template>
<script lang="ts" setup></script>
