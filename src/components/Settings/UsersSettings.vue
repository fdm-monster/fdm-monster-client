<template>
  <v-card>
    <SettingsToolbar :icon="page.icon" :title="page.title" style="width: 100%">
      <v-spacer />
      <v-btn
        :disabled="!profile?.isRootUser"
        class="mt-2"
        color="primary"
        @click="openCreateUserDialog()"
      >
        <v-icon class="mr-2">verified_user</v-icon>
        <span>Create verified user</span>
      </v-btn>
    </SettingsToolbar>

    <GridLoader
      v-if="loading"
      :size="20"
      color="#a70015"
      style="margin: 250px; position: absolute"
    />

    <v-list subheader three-line>
      <v-subheader> Showing all users </v-subheader>

      <v-list-item
        v-for="(user, index) in users"
        :key="index"
        class="pl-6"
        style="max-width: 800px; border-top: 1px solid grey; border-bottom: 1px solid grey"
      >
        <v-list-item-content
          :class="isCurrentAccount(user) ? 'pl-6 grey darken-3' : 'pl-6 grey darken-4'"
        >
          <v-list-item-title>
            User '{{ user.username }}'
            <strong v-if="isCurrentAccount(user)" class="text--primary float-end mr-5 mt-2">
              Your account
            </strong>
          </v-list-item-title>
          <v-list-item-subtitle></v-list-item-subtitle>
          <span class="grey--text darken-4">
            <ul>
              <li>
                <span v-if="user.isVerified" class="success--text">Account verified</span>
                <span v-else class="error--text">Account not verified</span>
              </li>
              <li>Created at {{ formatIntlDate(user.createdAt) }}</li>
              <li v-if="user.isDemoUser">Demo user account</li>

              <li>
                Role(s)
                <ul>
                  <li v-if="user.isRootUser">
                    <v-chip class="mb-2 mt-2" small> OWNER </v-chip>
                  </li>
                  <li v-for="role of convertRoles(user.roles)" :key="role">
                    <v-chip class="mb-2 mt-2" small>
                      {{ role }}
                    </v-chip>
                  </li>
                </ul>
              </li>
            </ul>
          </span>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            :disabled="isCurrentAccount(user) || user.isRootUser"
            :color="user.isVerified ? 'error darken-4' : 'success'"
            @click="verifyUser(user, !user.isVerified)"
          >
            <v-icon class="mr-2">shield</v-icon>
            <span v-if="!user.isVerified">Verify account</span>
            <span v-if="user.isVerified">Un-verify account</span>
          </v-btn>

          <v-btn
            :color="user.isRootUser ? 'error darken-4' : 'success'"
            :disabled="isCurrentAccount(user) || !profile?.isRootUser"
            class="mt-2"
            @click="setRootUser(user, !user.isRootUser)"
          >
            <v-icon class="mr-2">key</v-icon>
            <span v-if="user.isRootUser">Remove owner</span>
            <span v-if="!user.isRootUser">Set owner</span>
          </v-btn>

          <v-select
            v-if="profile?.isRootUser"
            :items="roles.map((r) => ({ text: r.name, value: r.id }))"
            v-model="user.roles"
            multiple
            label="Select roles"
            @change="updateUserRoles(user)"
            class="pt-6"
            style="width: 15rem"
          />

          <v-btn
            :disabled="isCurrentAccount(user) || user.isRootUser"
            class="mt-2"
            color="error darken-2"
            @click="deleteUser(user)"
          >
            <v-icon class="mr-2">delete</v-icon>
            Delete
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { UserService } from "@/backend/user.service";
import { Role, User } from "@/models/user.model";
import { formatIntlDate } from "@/utils/date.utils";
import GridLoader from "@/components/Generic/Loaders/GridLoader.vue";
import { useQuery } from "@tanstack/vue-query";
import { useSnackbar } from "@/shared/snackbar.composable";
import SettingsToolbar from "@/components/Settings/Shared/SettingsToolbar.vue";
import { useDialog } from "@/shared/dialog.composable";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { settingsPage } from "@/components/Settings/Shared/setting.constants";

const page = settingsPage["users"];
const snackbar = useSnackbar();
const loading = ref<boolean>(false);
const profile = ref<User>();
const users = ref<User[]>([]);
const roles = ref<Role[]>([]);

async function loadData() {
  loading.value = true;
  try {
    profile.value = await UserService.getProfile();
    roles.value = await UserService.listRoles();
    users.value = await UserService.listUsers();
  } catch (e) {
    loading.value = false;
    console.error(e);
    throw e;
  }

  loading.value = false;

  return {
    users,
    roles,
    profile,
  };
}

const userQuery = useQuery({
  queryKey: ["userRolesProfile"],
  queryFn: loadData,
});

function convertRoles(roleIds: (string | number)[]): (string | undefined)[] {
  return roleIds.map((roleId) => roles.value.find((r) => r.id == roleId)?.name);
}

function isCurrentAccount(user: User): boolean {
  return user.id == profile.value?.id;
}

async function deleteUser(user: User) {
  if (!confirm(`Are you sure you want to delete ${user.username}?`)) {
    return;
  }

  try {
    loading.value = true;
    await UserService.deleteUser(user.id);
    await userQuery.refetch();
  } catch (e) {
    loading.value = false;
    console.error(e);
    throw e;
  }
  loading.value = false;

  snackbar.info(`User ${user.username} deleted`);
}

async function verifyUser(user: User, isVerified: boolean = true) {
  if (user.isRootUser) {
    snackbar.error("You are not allowed to do perform this action on an owner");
    return;
  }
  if (
    !confirm(`Are you sure you want to ${isVerified ? "verify" : "unverify"} ${user.username}?`)
  ) {
    return;
  }

  try {
    loading.value = true;
    await UserService.setUserVerified(user.id, isVerified);
    await userQuery.refetch();
  } catch (e) {
    loading.value = false;
    console.error(e);
    throw e;
  }
  loading.value = false;

  snackbar.info(isVerified ? `User ${user.username} verified` : `User ${user.username} unverified`);
}

async function setRootUser(user: User, isRootUser: boolean = true) {
  if (!profile.value?.isRootUser) {
    snackbar.error("You are not allowed to do perform this action as you're not an owner");
  }

  if (
    !confirm(
      `You are about to ${isRootUser ? "set" : "remove"} owner rights on ${
        user.username
      }. Are you sure?`
    )
  ) {
    return;
  }

  try {
    loading.value = true;
    await UserService.setRootUser(user.id, isRootUser);
    await userQuery.refetch();
  } catch (e) {
    loading.value = false;
    console.error(e);
    throw e;
  }
  loading.value = false;

  snackbar.info(
    isRootUser ? `User ${user.username} set to owner` : `User ${user.username} is no longer owner`
  );
}

// Define the new function to update user roles
async function updateUserRoles(user: User) {
  try {
    loading.value = true;
    console.log(user.roles);
    console.log(user.roles.map((v) => typeof v));
    await UserService.setUserRoles(user.id, user.roles);
    await userQuery.refetch();
    snackbar.info(`Roles updated for ${user.username}`);
  } catch (e) {
    loading.value = false;
    console.error(e);
    snackbar.error(`Failed to update roles for ${user.username}`);
    throw e;
  }
  loading.value = false;
}

async function openCreateUserDialog() {
  await useDialog(DialogName.CreateUserDialog).openDialog();
}
</script>
