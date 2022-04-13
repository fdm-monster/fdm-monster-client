import { describe, expect, it } from "vitest";

import { mount } from "@vue/test-utils";
import FormText from "../FormText.vue";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVuetify } from "vuetify";

describe("FormText", () => {
  const vuetify = createVuetify({ components, directives });

  const defaultModelValue = "noValue";
  const defaultLabel = "Email";
  it("renders properly", () => {
    const component = mount(FormText, {
      global: {
        plugins: [vuetify],
      },
      attrs: {
        label: defaultLabel,
        modelValue: defaultModelValue,
      },
    });
    expect(component.text()).toContain(defaultLabel);
    expect(component.html()).toContain("input");
    expect(component.html()).toContain('type="text"');
    expect(component.props().modelValue).toContain(defaultModelValue);
  });
});
