<template>
  <div>
    <v-text-field
        :error="!!validation.errorMessage"
        :error-messages="validation.errorMessage"
        :label="label"
        :model-value="modelValue"
        @input="update"
    ></v-text-field>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    modelValue: {required: true},
    required: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default: () => ({type: "text"}),
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: "text",
    },
  },
  computed: {},
  methods: {
    update(value: any | null) {
      this.$emit("update:modelValue", value);
    },
  },
});
</script>
