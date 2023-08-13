import { extend, setInteractionMode } from "vee-validate";
import { alpha_num, digits, integer, length, max, min, required } from "vee-validate/dist/rules";
import isURL from "validator/lib/isURL";

export function configureVeeValidate() {
  setInteractionMode("eager");

  extend("digits", {
    ...digits,
    message: "{_field_} needs to be {length} digits. ({_value_})",
  });

  extend("required", {
    ...required,
    message: "{_field_} can not be empty",
  });

  extend("length", {
    ...length,
    message: "{_field_} must be of length {length}",
  });

  extend("integer", {
    ...integer,
    message: "{_field_} must be an integer",
  });

  extend("alpha_num", {
    ...alpha_num,
    message: "{_field_} must be alphanumeric",
  });

  extend("min", {
    ...min,
    message: "{_field_} must at least {length} characters long",
  });

  extend("max", {
    ...max,
    message: "{_field_} may not be greater than {length} characters",
  });

  extend("url", {
    validate: (value) => {
      return isURL(value?.trimEnd(), {
        protocols: ["http", "https"],
        require_tld: false,
        require_protocol: false,
        require_host: true,
        require_port: false,
        require_valid_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false,
        allow_fragments: false,
        allow_query_components: false,
        validate_length: true,
      });
    },
    message: "{_field_} must be a valid URL",
  });
}
