<template>
  <v-snackbar
    v-model="snackbarOpened"
    absolute
    bottom
    color="success"
    elevation="24"
    shaped
    timeout="5000"
    multi-line
  >
    <v-row>
      <v-col cols="2">
        <v-btn icon large>
          <v-icon>info</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="8" class="d-flex align-center flex-row">
        <div>
          <span class="font-weight-bold text-button">{{ infoTitle }}</span>
          <div v-if="infoSubtitle?.length">{{ infoSubtitle }}</div>
        </div>
      </v-col>
      <v-col cols="1">
        <v-btn icon large @click="snackbarOpened = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { InfoMessage, useSnackbar } from "../../../shared/snackbar.composable";
import { onMounted, ref } from "vue";

const snackbar = useSnackbar();
const snackbarOpened = ref(false);
const infoTitle = ref("");
const infoSubtitle = ref("");

onMounted(() => {
  snackbar.onInfoMessage((data: InfoMessage) => {
    infoTitle.value = data.title;
    infoSubtitle.value = data.subtitle ?? "";
    snackbarOpened.value = true;
  });
});
</script>
