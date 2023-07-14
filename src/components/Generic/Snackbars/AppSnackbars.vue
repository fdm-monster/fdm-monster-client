<template>
  <div>
    <AppInfoSnackbar />
    <AppErrorSnackbar />
    <AppProgressSnackbar />
    <AlertErrorDialog />
  </div>
</template>

<script lang="ts" setup>
import AlertErrorDialog from "./AlertErrorDialog.vue";
import AppInfoSnackbar from "./AppInfoSnackbar.vue";
import AppErrorSnackbar from "./AppErrorSnackbar.vue";
import AppProgressSnackbar from "./AppProgressSnackbar.vue";
</script>
