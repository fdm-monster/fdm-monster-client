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
type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
};

export default defineComponent({
  props: {
    modelValue: { required: true },
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
      default: () => ({ type: "text" }),
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
    update(event: Event) {
      const target = event.target as HTMLInputElement;
      this.$emit("update:modelValue", target.value);
    },
  },
});
</script>
