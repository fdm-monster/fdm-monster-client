<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Users</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-subheader>Showing current users</v-subheader>

      <v-list-item v-for="(user, index) in users" :key="index">
        <v-list-item-content>
          <v-list-item-title>
            User <strong>{{ user.name }}</strong>
          </v-list-item-title>
          <v-list-item-subtitle>
            Username <strong>{{ user.username }}</strong> <br />
            <br />
          </v-list-item-subtitle>
          <v-list-item-subtitle>
            Created at <strong>{{ user.createdAt }}</strong> <br />
            Role count <strong>{{ user.roles.length }}</strong>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { UserService } from "@/backend/user.service";
import type { User } from "@/models/user.model";
import { onMounted } from "@vue/runtime-core";

const users = ref<User[]>([]);

onMounted(async () => {
  users.value = await UserService.listUsers();
});
</script>
