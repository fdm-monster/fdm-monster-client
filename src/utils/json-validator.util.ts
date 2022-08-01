export const jsonValidatorUtil = (raw: any) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const jsonValidationMessage = { message: "String must be valid JSON" };
