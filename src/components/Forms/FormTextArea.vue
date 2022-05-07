<template>
  <v-textarea
      :error="!!validation.errorMessage"
      :error-messages="validation.errorMessage"
      :label="label"
      :model-value="modelValue"
      :rows="config.rows || 5"
      @input="update"
  >
  </v-textarea>
</template>

<script lang="ts">

type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
};

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
      default: () => ({type: "text", rows: 15}),
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
  methods: {
    update(event: HTMLElementEvent<HTMLInputElement>) {
      this.$emit("update:modelValue", event.target.value);
    },
  },
});
</script>
