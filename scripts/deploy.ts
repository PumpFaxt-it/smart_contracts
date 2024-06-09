import { ethers } from "hardhat";
import "dotenv/config";
import { consoleColor } from "../utils";

const ONE_FRAX = BigInt(Math.pow(10, 18));

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) throw "Provide deployer private key";

  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);

  const DummyFrax = await ethers.getContractFactory("DummyFrax");
  const frax = await DummyFrax.deploy();

  console.log(
    consoleColor("yellow"),
    "DummyFrax",
    consoleColor("white"),
    "deployed to :",
    consoleColor("cyan"),
    await frax.getAddress()
  );

  const PumpItFaxtInterface = await ethers.getContractFactory(
    "PumpItFaxtInterface"
  );
  const pumpItFaxt = await PumpItFaxtInterface.connect(deployer).deploy(
    await frax.getAddress()
  );

  await pumpItFaxt.setDeploymentCharge(BigInt(2) * ONE_FRAX);
  await pumpItFaxt.setMinimumInitialTokenSupply(BigInt(69_420_000) * ONE_FRAX);
  await pumpItFaxt.setMaximumInitialTokenSupply(
    BigInt(1_000_000_000) * ONE_FRAX
  );

  console.log(
    consoleColor("yellow"),
    "PumpItFaxtInterface",
    consoleColor("white"),
    "deployed to :",
    consoleColor("cyan"),
    await pumpItFaxt.getAddress()
  );

  console.log(consoleColor("white"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
