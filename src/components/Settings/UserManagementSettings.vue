<template>
  <v-card>
    <v-toolbar color="primary">
      <v-avatar>
        <v-icon>settings</v-icon>
      </v-avatar>
      <v-toolbar-title>Users</v-toolbar-title>
    </v-toolbar>
    <GridLoader
      v-if="loading"
      :size="20"
      color="#a70015"
      style="margin: 250px; position: absolute"
    />
    <v-list subheader three-line>
      <v-subheader>Showing all users</v-subheader>

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
          <v-list-item-subtitle> </v-list-item-subtitle>
          <span class="grey--text darken-4">
            <ul>
              <li v-if="user.isVerified">
                <span class="success--text">Account verified</span>
              </li>
              <li>Created at {{ formatIntlDate(user.createdAt) }}</li>
              <li v-if="user.isDemoUser">Demo user account</li>
              <li v-if="user.isRootUser">Root user account (created autonomously)</li>
              <li v-if="!user.isVerified">
                <span class="error--text">Account not verified</span>
              </li>
              <li>
                Role(s)
                <ul>
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
            color="error darken-2"
            @click="deleteUser(user)"
            :disabled="isCurrentAccount(user)"
          >
            <v-icon class="mr-2">delete</v-icon>
            Delete
          </v-btn>
          <v-btn
            v-if="!user.isVerified"
            class="mt-2"
            color="success"
            @click="verifyUser(user)"
            :disabled="isCurrentAccount(user)"
          >
            <v-icon class="mr-2">shield</v-icon>
            Verify account
          </v-btn>
          <v-btn
            v-if="user.isVerified"
            class="mt-2"
            color="error darken-4"
            @click="verifyUser(user, false)"
            :disabled="isCurrentAccount(user)"
          >
            <v-icon class="mr-2">shield</v-icon>
            Unverify account
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
  if (!confirm(`Are you sure you want to verify ${user.username}?`)) {
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
</script>
