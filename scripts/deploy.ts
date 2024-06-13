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

  await pumpItFaxt.deployNewToken(
    69_420_420,
    "Frax Doge",
    "FXD",
    "https://fraxdoge.xyz/assets/img1-CKTqI1qj.jpeg",
    JSON.stringify({ website: "fraxdoge.xyz", telegram : "fxd" })
  );

  console.log(consoleColor("white"));

  const fraxAbi = JSON.stringify(
    JSON.parse(
      readFileSync("./artifacts/contracts/DummyFrax.sol/DummyFrax.json", "utf8")
    ).abi
  );
  const pumpItFaxtAbi = JSON.stringify(
    JSON.parse(
      readFileSync(
        "./artifacts/contracts/PumpItFaxtInterface.sol/PumpItFaxtInterface.json",
        "utf8"
      )
    ).abi
  );
  const tokenAbi = JSON.stringify(
    JSON.parse(
      readFileSync(
        "./artifacts/contracts/ERC20BondingCurve.sol/ERC20BondingCurve.json",
        "utf8"
      )
    ).abi
  );

  writeFileSync(
    "../client/src/contracts/frax.ts",
    `
    const address = "${await frax.getAddress()}" as const; 

    const abi = ${fraxAbi} as const; 
    
    export default {address, abi}`
  );
  writeFileSync(
    "../client/src/contracts/pumpItFaxtInterface.ts",
    `
    const address = "${await pumpItFaxt.getAddress()}" as const; 

    const abi = ${pumpItFaxtAbi} as const; 
    
    export default {address, abi}`
  );
  writeFileSync(
    "../client/src/contracts/token.ts",
    `
    const abi = ${tokenAbi} as const; 
    
    export default {abi}`
  );

  writeFileSync(
    "../server/contracts/frax.ts",
    `
    const address = "${await frax.getAddress()}" as const; 

    const abi = ${fraxAbi} as const; 
    
    export default {address, abi}`
  );
  writeFileSync(
    "../server/contracts/pumpItFaxtInterface.ts",
    `
    const address = "${await pumpItFaxt.getAddress()}" as const; 

    const abi = ${pumpItFaxtAbi} as const; 
    
    export default {address, abi}`
  );
  writeFileSync(
    "../server/contracts/token.ts",
    `
    const abi = ${tokenAbi} as const; 
    
    export default {abi}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
