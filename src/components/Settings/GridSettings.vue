<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" />

    <GridSettingsList />
  </v-card>
</template>

<script setup lang="ts">
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";

import GridSettingsList from "@/components/Settings/Shared/GridSettingsList.vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";

const page = settingsPage["grid"];
</script>
