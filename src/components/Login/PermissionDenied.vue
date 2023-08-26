<template>
  <v-container fill-height fluid>
    <v-app-bar app color="primary" dark>
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

    <v-layout align-center column justify-center>
      <v-card class="flex align-center justify-center pa-lg-16 pa-sm-10" style="width: 80%">
        <v-card-title>
          <v-icon class="mr-4" size="50">lock</v-icon>
          <h3>Permission Denied</h3>
        </v-card-title>
        <v-card-subtitle class="mt-1">
          You do not have permission to access a specific resource on this page.
        </v-card-subtitle>

        <v-card-text v-if="permissionProblems">
          <div v-if="permissionProblems.page">
            Page: <strong>{{ permissionProblems?.page }}</strong>
          </div>
          <div v-if="permissionProblems.permissions">
            Required permission(s):
            <strong v-for="perm of permissionProblems.permissions" :key="perm">{{ perm }}</strong>
          </div>
          <div v-if="permissionProblems.roles">
            Usable roles:
            <strong>{{ permissionProblems.roles?.join(", ") }}</strong>
          </div>
          <div v-if="permissionProblems.url">
            Problematic API path:
            <strong>{{ permissionProblems.url }}</strong>
          </div>
          <div v-if="permissionProblems.error">
            Error:
            <strong>{{ permissionProblems.error }}</strong>
          </div>
        </v-card-text>
        <v-card-actions class="mt-6">
          <v-btn class="align-center" color="primary" to="/" variant="elevated">
            <v-icon class="mr-2">home</v-icon>
            Go home
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-container>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router/composables";

const route = useRoute();

interface PermissionDeniedQuery {
  roles: string[];
  permissions?: string[];
  url?: string;
  page?: string;
  error?: string;
}

const permissionProblems = computed(() => {
  return route.query as any as PermissionDeniedQuery;
});
</script>
