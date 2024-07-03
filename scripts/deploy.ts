import "dotenv/config";
import { ethers } from "hardhat";
import { consoleColor } from "../utils";
import { JsonRpcProvider } from "ethers";
import { writeFileSync, readFileSync } from "fs";

// import "../../client/src/contracts/frax"
const ONE_FRAX = BigInt(Math.pow(10, 18));

async function main() {
  if (!process.env.DEPLOYER_PRIVATE_KEY) throw "Provide deployer private key";

  const provider = new JsonRpcProvider("http://127.0.0.1:8545/");

  const [deployer] = await ethers.getSigners();

  console.log("Deployer : ", deployer.address);

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
  const UsernameRental = await ethers.getContractFactory("UsernameRental");

  const fraxAddr = await frax.getAddress();
  const pumpItFaxt = await PumpItFaxtInterface.deploy(
    fraxAddr,
    "0xAAA16c016BF556fcD620328f0759252E29b1AB57",
    "0xAAA45c8F5ef92a000a121d102F4e89278a711Faa"
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

  const usernameRental = await UsernameRental.deploy(fraxAddr);
  await usernameRental.waitForDeployment();
  console.log(
    consoleColor("yellow"),
    "UsernameRental",
    consoleColor("white"),
    "deployed to :",
    consoleColor("cyan"),
    await usernameRental.getAddress()
  );

  const deploymentCharge = 2;
  await (
    await pumpItFaxt.setDeploymentCharge(BigInt(deploymentCharge) * ONE_FRAX)
  ).wait();
  console.log("Deployment Charge set to : ", deploymentCharge);

  await (
    await pumpItFaxt.setMinimumInitialTokenSupply(BigInt(69_420_000) * ONE_FRAX)
  ).wait();
  await (
    await pumpItFaxt.setMaximumInitialTokenSupply(
      BigInt(1_000_000_000) * ONE_FRAX
    )
  ).wait();
  await (await pumpItFaxt.setThresholdForDex(BigInt(50_000) * ONE_FRAX)).wait();

  await frax.transfer(
    "0x9B28C43d4526202c316b9ab0ECCB757C4D9c5155",
    1000000n * ONE_FRAX
  );

  console.log(consoleColor("white"));

  async function writeAbi(filename: string, contract: any, clientName: string) {
    const abi = JSON.stringify(
      JSON.parse(
        readFileSync(
          `./artifacts/contracts/${filename}.sol/${filename}.json`,
          "utf8"
        )
      ).abi
    );

    writeFileSync(
      `../client/src/contracts/${clientName}.ts`,

      `const address = "${await contract.getAddress()}" as const; 

    const abi = ${abi} as const; 
    
    export default {address, abi}`
    );
    writeFileSync(
      `../server/contracts/${clientName}.ts`,

      `const address = "${await contract.getAddress()}" as const; 

    const abi = ${abi} as const; 
    
    export default {address, abi}`
    );
  }

  await writeAbi("DummyFrax", frax, "frax");
  await writeAbi("PumpItFaxtInterface", pumpItFaxt, "pumpItFaxtInterface");
  await writeAbi("UsernameRental", usernameRental, "usernameRental");

  // await (
  //   await frax.approve(
  //     await pumpItFaxt.getAddress(),
  //     BigInt(deploymentCharge) * ONE_FRAX
  //   )
  // ).wait();
  // await (
  //   await pumpItFaxt.deployNewToken(
  //     BigInt(1_000_000_000),
  //     "Name",
  //     "NAME",
  //     "https://recipeforperfection.com/wp-content/uploads/2017/11/Movie-Theater-Popcorn-in-a-popcorn-bucket.jpg",
  //     `{"description":"ok"}`
  //   )
  // ).wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
