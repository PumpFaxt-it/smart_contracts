import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: { version: "0.8.24", settings: { optimizer: true } },
  networks: {
    testnet: {
      url: "https://rpc.testnet.frax.com",
      chainId: 2522,
      accounts: [`${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
    fraxtal: {
      url: "https://rpc.frax.com",
      chainId: 252,
      accounts: [`${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
  },
};

export default config;
