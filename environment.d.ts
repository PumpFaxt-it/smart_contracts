declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEPLOYER_PRIVATE_KEY: string;
    }
  }
}
