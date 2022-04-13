<template>
  <div>
    <v-text-field
      :error="!!validation.errorMessage"
      :error-messages="validation.errorMessage"
      :label="label"
      :model-value="modelValue"
      @input="update($event.target.value)"
    ></v-text-field>
  </div>
</template>

<script>
export default {
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
    update(value) {
      this.$emit("update:modelValue", value);
    },
  },
};
</script>
