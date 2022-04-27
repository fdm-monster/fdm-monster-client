export const isDevEnv = () => {
  return getEnvName() == "development";
};

export const getEnvName = () => {
  // @ts-ignore
  return process.env.NODE_ENV;
};
