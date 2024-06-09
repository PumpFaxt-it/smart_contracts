import { ethers } from "hardhat";
import 'dotenv/config'

const ONE_FRAX = BigInt(Math.pow(10, 18));

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) throw ("Provide deployer private key")
  
  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY)

  const DummyFrax = await ethers.getContractFactory("DummyFrax");
  const frax = await DummyFrax.deploy();

  console.log("DummyFrax deployed to : ", await frax.getAddress());

  const PumpItFaxtInterface = await ethers.getContractFactory(
    "PumpItFaxtInterface"
  );
  const pumpItFaxt = await PumpItFaxtInterface.deploy(await frax.getAddress());

  pumpItFaxt.setDeploymentCharge(BigInt(2) * ONE_FRAX);
  pumpItFaxt.setMinimumInitialTokenSupply(BigInt(69_420_000) * ONE_FRAX);
  pumpItFaxt.setMaximumInitialTokenSupply(BigInt(1_000_000_000) * ONE_FRAX);

  console.log(
    "PumpItFaxtInterface deployed to : ",
    await pumpItFaxt.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
