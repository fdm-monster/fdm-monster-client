import { defineRule } from "vee-validate";
import AllRules from "@vee-validate/rules";
import validator from "validator";
import { SchemaFormFactory } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";

export const SchemaFormWithValidation = SchemaFormFactory([
  VeeValidatePlugin({
    // plugin configuration here
  }),
]);

export function configureVeeValidate() {
  Object.keys(AllRules).forEach((rule) => {
    defineRule(rule, AllRules[rule]);
  });

  defineRule("ip_or_fqdn", (value: any) => {
    return (
      validator.isFQDN(value) || validator.isIP(value) || value === "localhost"
    );
  });

  defineRule("json", (value: any) => {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  });
}
