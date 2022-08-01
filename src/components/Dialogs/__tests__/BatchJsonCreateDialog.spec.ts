import { describe, expect, it } from "vitest";
import BatchJsonCreateDialog from "../BatchJsonCreateDialog.vue";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createVuetify } from "vuetify";
import { getTestConfig } from "../../../utils/tests/test-mount.util";
import { mount } from "@vue/test-utils";
import FormTextArea from "@/components/Forms/FormTextArea.vue";
import { usePrintersStore } from "../../../stores";

describe("BatchJsonCreateDialog", () => {
  const vuetify = createVuetify({ components, directives });

  it("renders", async () => {
    const component = mount(BatchJsonCreateDialog, getTestConfig(vuetify));
    const printersStore = usePrintersStore();

    expect(component.vm.showDialog).toBeFalsy();
    printersStore.setBatchJsonCreateDialogOpened(true);

    await component.vm.$nextTick();
    expect(component.vm.showDialog).toBeTruthy();

    expect(component.findComponent(".v-card-actions").html()).toContain(
      "Create"
    );
  });

  it("formvalidation must fail by default", async () => {
    const component = mount(BatchJsonCreateDialog, getTestConfig(vuetify));
    expect(component.vm.isFormValid).toBeFalsy();
  });

  it("formvalidation must succeed on known printer", async () => {
    const component = mount(BatchJsonCreateDialog, getTestConfig(vuetify));
    const printersStore = usePrintersStore();
    printersStore.setBatchJsonCreateDialogOpened(true);
    await component.vm.$nextTick();

    const formTextArea = component.findComponent(FormTextArea);
    expect(formTextArea.html()).toContain("textarea");
    const textArea = formTextArea.find("textarea").element;
    expect(textArea).toBeTruthy();
    expect(textArea.value).toBeFalsy();
    textArea.value = "asd";

    await component.vm.$nextTick();
    // console.log(component.vm.formValidation);
    expect(component.vm.formData.raw).toEqual([]);
    (formTextArea.vm.modelValue as any).value = [{ apiKey: "asd" }];

    expect(component.vm.formData.raw).not.toEqual([]);
    expect(component.vm.formErrors).toHaveLength(0);

    // expect(component.vm.isFormValid).toBeFalsy();
  });
});
