<template>
  <v-row>
    <v-col>
      <v-sheet height="600">
        <v-calendar dark ref="calendar" type="week">
        </v-calendar>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
</script>

<style lang="scss">
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;

  &.first::before {
    content: "";
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
</style>
