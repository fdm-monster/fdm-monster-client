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
          <v-list-item-content v-if="!loginEnabled">
            <v-alert color="primary">
              Login is currently disabled. To adjust your username and password, please enable that
              setting at the Server Protection settings page. Then log in and visit this page.
            </v-alert>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-content>
    </v-list>
    <v-list subheader three-line>
      <v-list-item-content>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Username</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field
                v-model="formData.username"
                :disabled="!loginEnabled"
                label="Fill in your username"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <div class="ml-4 mb-4">
          <v-btn :disabled="!loginEnabled" color="primary" @click="changeUsername()"
            >Change username
          </v-btn>
        </div>
        <v-divider />
        <br />

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Old Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field
                v-model="formData.oldPassword"
                :disabled="!loginEnabled"
                placeholder="Old password"
                type="password"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> New Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field
                v-model="formData.newPassword"
                :disabled="!loginEnabled"
                placeholder="New password"
                type="password"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title> Repeat New Password</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field
                v-model="formData.repeatPassword"
                :disabled="!loginEnabled"
                placeholder="Repeat new password"
                type="password"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-content>
    </v-list>
    <div class="ml-4 mb-4">
      <v-btn :disabled="!loginEnabled" color="primary" @click="changePassword()"
        >Change password
      </v-btn>
    </div>
    <v-divider />
  </v-card>
</template>

<script lang="ts" setup>
import { useProfileStore } from "@/store/profile.store";
import { onMounted, ref } from "vue";
import { UserService } from "@/backend/user.service";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useAuthStore } from "@/store/auth.store";
import { routeToLogin } from "@/router/utils";
import { useRouter } from "vue-router/composables";
import { useSettingsStore } from "@/store/settings.store";

const settingsStore = useSettingsStore();
const profileStore = useProfileStore();
const authStore = useAuthStore();
const router = useRouter();
const snackbar = useSnackbar();
const loginEnabled = ref<boolean>();
const userId = ref<string>("");
const formData = ref<{
  username: string;
  oldPassword: string;
  newPassword: string;
  repeatPassword: string;
}>({ username: "", newPassword: "", oldPassword: "", repeatPassword: "" });

onMounted(async () => {
  await settingsStore.loadSettings();
  if (!settingsStore.settings?.server.loginRequired) {
    loginEnabled.value = settingsStore.settings?.server.loginRequired;
  }
  await profileStore.getProfile();
  formData.value.username = profileStore.username as string;
  userId.value = profileStore.userId as string;
});

async function changeUsername() {
  if (!userId.value?.length) {
    snackbar.openErrorMessage({ title: "User not loaded" });
    return;
  }
  await UserService.changeUsername(userId.value, formData.value.username);

  await profileStore.getProfile();
  formData.value.username = profileStore.username as string;
  snackbar.openInfoMessage({ title: "Username changed" });
}

async function changePassword() {
  if (!userId.value?.length) {
    snackbar.openErrorMessage({ title: "User not loaded" });
    return;
  }
  if (formData.value.newPassword !== formData.value.repeatPassword) {
    snackbar.openErrorMessage({ title: "Passwords do not match" });
    return;
  }
  await UserService.changePassword(
    userId.value,
    formData.value.oldPassword,
    formData.value.newPassword
  );
  formData.value.oldPassword = "";
  formData.value.newPassword = "";
  formData.value.repeatPassword = "";
  snackbar.openInfoMessage({ title: "Password changed" });
  await authStore.logout(true);
  await routeToLogin(router);
}
</script>
