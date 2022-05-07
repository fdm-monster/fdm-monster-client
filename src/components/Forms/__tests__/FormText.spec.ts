import { describe, expect, it } from "vitest";

import { mount } from "@vue/test-utils";
import FormText from "../FormText.vue";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVuetify } from "vuetify";
import { getTestConfig } from "@/utils/tests/test-mount.util";

describe("FormText", () => {
  const vuetify = createVuetify({ components, directives });

  const defaultModelValue = "noValue";
  const defaultLabel = "Email";
  it("renders properly", () => {
    const testConfig = getTestConfig(vuetify);
    testConfig.props = {
      label: defaultLabel,
      modelValue: defaultModelValue,
    };
    // @ts-ignore
    const component = mount(FormText, testConfig);
    expect(component.text()).toContain(defaultLabel);
    expect(component.html()).toContain("input");
    expect(component.html()).toContain('type="text"');
    expect(component.props().modelValue).toContain(defaultModelValue);
  });
});
