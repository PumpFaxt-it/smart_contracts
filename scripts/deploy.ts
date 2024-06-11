import "dotenv/config";
import { ethers } from "hardhat";
import { consoleColor } from "../utils";
import { JsonRpcProvider } from "ethers";

const ONE_FRAX = BigInt(Math.pow(10, 18));

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) throw "Provide deployer private key";

  const provider = new JsonRpcProvider("http://127.0.0.1:8545/");
  const deployer = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY,
    provider
  );

  const [ethHolder] = await ethers.getSigners();
  const tx = await ethHolder.sendTransaction({
    to: deployer.address,
    value: ethers.parseUnits("100", "ether"),
  });
  await tx.wait();

  const DummyFrax = await ethers.getContractFactory("DummyFrax");
  const frax = await DummyFrax.deploy();
  await frax.waitForDeployment();

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

  const fraxAddr = await frax.getAddress();
  const pumpItFaxt = await PumpItFaxtInterface.connect(deployer).deploy(
    fraxAddr
  );
  await pumpItFaxt.waitForDeployment();

  console.log(
    consoleColor("yellow"),
    "PumpItFaxtInterface",
    consoleColor("white"),
    "deployed to :",
    consoleColor("cyan"),
    await pumpItFaxt.getAddress()
  );

  await (await pumpItFaxt.setDeploymentCharge(BigInt(2) * ONE_FRAX)).wait();
  await (
    await pumpItFaxt.setMinimumInitialTokenSupply(BigInt(69_420_000) * ONE_FRAX)
  ).wait();
  await (
    await pumpItFaxt.setMaximumInitialTokenSupply(
      BigInt(1_000_000_000) * ONE_FRAX
    )
  ).wait();

  console.log(consoleColor("white"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
