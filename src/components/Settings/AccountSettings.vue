<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>account_circle</v-icon>
      </v-avatar>
      <v-toolbar-title>Account Settings</v-toolbar-title>
    </v-toolbar>
    <v-list subheader three-line>
      <v-list-item-content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Username</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.username" disabled label="username" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <br />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.password" disabled label="password" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Repeat Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="formData.repeatPassword" disabled label="repeatPassword" />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-content>
    </v-list>
    <v-divider />
  </v-card>
</template>

<script lang="ts" setup>
import { useProfileStore } from "@/store/profile.store";
import { onMounted, ref } from "vue";

const profileStore = useProfileStore();
const formData = ref<{
  username: string;
  password: string;
  repeatPassword: string;
}>({ username: "", password: "", repeatPassword: "" });
onMounted(async () => {
  await profileStore.getProfile();
  formData.value.username = profileStore.username;
});
</script>
