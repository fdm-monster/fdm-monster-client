<template>
  <v-list subheader three-line>
    <v-subheader>
      <span class="pr-3">
        {{ props.title }}
      </span>

      <v-tooltip bottom v-if="props.tooltip?.length">
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="help-icon" v-bind="attrs" v-on="on">help_outline</v-icon>
        </template>
        <span class="tooltip-content">
          {{ tooltip }}
        </span>
      </v-tooltip>
    </v-subheader>
    <v-list-item>
      <v-list-item-content>
        <v-row v-if="usecols">
          <v-col cols="4">
            <slot></slot>
          </v-col>
        </v-row>
        <slot v-else></slot>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  tooltip: String,
  usecols: {
    type: Boolean,
    default: true,
  },
});
</script>
