import { ethers } from "hardhat";

async function main() {
  const DummyFrax = await ethers.getContractFactory("DummyFrax");
  const frax = await DummyFrax.deploy();

  console.log("DummyFrax deployed to:", await frax.getAddress());

  const PumpItFaxtInterface = await ethers.getContractFactory(
    "PumpItFaxtInterface"
  );
  const pumpItFaxt = await PumpItFaxtInterface.deploy(await frax.getAddress());

  console.log(
    "PumpItFaxtInterface deployed to:",
    await pumpItFaxt.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
