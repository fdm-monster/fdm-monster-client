<template>
  <v-badge v-if="printer.enabled" class="ma-2" overlap>
    <template #badge>
      <v-icon>bolt</v-icon>
    </template>
    <v-btn fab small @click.stop="clickQuickStop">
      <v-icon>dangerous</v-icon>
    </v-btn>
  </v-badge>
</template>

<script lang="ts" setup>
import { PrinterDto } from "@/models/printers/printer.model";
import { CustomGcodeService } from "@/backend/custom-gcode.service";

const props = defineProps<{
  printer: PrinterDto;
}>();

async function clickQuickStop() {
  if (!confirm("Are you sure to delete this printer?")) return;

  await CustomGcodeService.postQuickStopM112Command(props.printer.id);
}
</script>
