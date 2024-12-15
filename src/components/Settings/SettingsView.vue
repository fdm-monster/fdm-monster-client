<template>
  <div style="height: calc(100vh - 64px)">
    <v-row no-gutters class="fill-height" style="padding: 0">
      <v-navigation-drawer :permanent="true" width="240" style="flex-shrink: 0; padding: 0">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6">Settings</v-list-item-title>
            <v-list-item-subtitle>Adjust your Fdm Monster</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider />

        <v-list dense nav>
          <v-list-item
            v-for="item in items"
            :key="item.title"
            :to="item.path"
            link
            router-link
            :style="item.divider ? 'border-bottom: 1px solid gray' : ''"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-col class="d-flex fill-height">
        <router-view class="grow" />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";

const items = ref(Object.values(settingsPage));
</script>
