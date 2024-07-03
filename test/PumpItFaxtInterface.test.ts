// import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { expect } from "chai";
// import hre from "hardhat";
// import { checkSorted } from "../utils";

// const imageUrl =
//   "https://assets.raribleuserdata.com/prod/v1/image/t_image_big/aHR0cHM6Ly9pcGZzLnJhcmlibGV1c2VyZGF0YS5jb20vaXBmcy9RbVRBSFVMQ0QydVVYVE05c2hBZHpOVGZZWGlnanVyWjl2VFZnQ29TMXd2QURVL2ltYWdlLmpwZWc=";
// const ONE_TOKEN = BigInt(Math.pow(10, 18));
// const ONE_FRAX = BigInt(Math.pow(10, 18));

// const initialSupply = BigInt(69_420_000);
// const reserveThreshold = BigInt(69420) * ONE_FRAX;

// describe("PumpItFaxtInterface", function () {
//   async function deployInterfaceFixture() {
//     const [owner, acc1, acc2] = await hre.ethers.getSigners();

//     const DummyFrax = await hre.ethers.getContractFactory("DummyFrax");
//     const frax = await DummyFrax.connect(owner).deploy();

//     const PumpItFaxtInterface = await hre.ethers.getContractFactory(
//       "PumpItFaxtInterface"
//     );
//     const pumpItFaxt = await PumpItFaxtInterface.connect(owner).deploy(
//       await frax.getAddress()
//     );

//     await frax.connect(owner).transfer(acc1.address, BigInt(50_000) * ONE_FRAX);
//     await frax.connect(owner).transfer(acc2.address, BigInt(50_000) * ONE_FRAX);

//     await pumpItFaxt.connect(owner).setMinimumInitialTokenSupply(BigInt(69_420_000) * ONE_FRAX);
//     await pumpItFaxt.connect(owner).setMaximumInitialTokenSupply(BigInt(1_000_000_000) * ONE_FRAX);

//     return {
//       pumpItFaxt,
//       frax,
//       owner,
//       acc1,
//       acc2,
//     };
//   }

//   describe("Deployment", function () {
//     it("Should set deployer as owner", async function () {
//       const { owner, pumpItFaxt } = await loadFixture(deployInterfaceFixture);

//       expect(await pumpItFaxt.owner()).to.equal(owner.address);
//     });

//     it("Should have no initial deployment charge", async function () {
//       const { pumpItFaxt } = await loadFixture(deployInterfaceFixture);

//       expect(await pumpItFaxt.deploymentCharge()).to.be.equal(0);
//     });
//   });

//   describe("Admininstration functions", function () {
//     it("Should let the owner set the deployment charge", async function () {
//       const { pumpItFaxt, owner } = await loadFixture(deployInterfaceFixture);

//       await pumpItFaxt.connect(owner).setDeploymentCharge(BigInt(2) * ONE_FRAX);

//       expect(await pumpItFaxt.deploymentCharge()).to.be.equal(
//         BigInt(2) * ONE_FRAX
//       );
//     });

//     it("Should not let other users set the deployment charge", async function () {
//       const { pumpItFaxt, acc1 } = await loadFixture(deployInterfaceFixture);

//       expect(pumpItFaxt.connect(acc1).setDeploymentCharge(BigInt(2) * ONE_FRAX))
//         .to.be.reverted;
//     });

//     it("Should charge deployment fees and let the owner withdraw frax from reserve", async function () {
//       const { pumpItFaxt, frax, owner, acc1, acc2 } = await loadFixture(
//         deployInterfaceFixture
//       );

//       const acc2InitialBalance = await frax.balanceOf(acc2.address);

//       await pumpItFaxt
//         .connect(owner)
//         .setDeploymentCharge(BigInt(10) * ONE_FRAX);

//       await frax
//         .connect(acc1)
//         .approve(await pumpItFaxt.getAddress(), BigInt(10) * ONE_FRAX);

//       await pumpItFaxt
//         .connect(acc1)
//         .deployNewToken(initialSupply, "txt", "true", "rand");

//       await pumpItFaxt.connect(owner).withdraw(acc2, BigInt(5) * ONE_FRAX);

//       expect(
//         (await frax.balanceOf(acc2.address)) - acc2InitialBalance
//       ).to.equal(BigInt(5) * ONE_FRAX);
//     });
//   });

//   describe("Token Creation", function () {
//     it("Should let the user create new token", async function () {
//       const { pumpItFaxt, acc1, frax, owner } = await loadFixture(
//         deployInterfaceFixture
//       );

//       await pumpItFaxt
//         .connect(owner)
//         .setDeploymentCharge(BigInt(10) * ONE_FRAX);

//       await frax
//         .connect(acc1)
//         .approve(await pumpItFaxt.getAddress(), BigInt(10) * ONE_FRAX);

//       await pumpItFaxt
//         .connect(acc1)
//         .deployNewToken(initialSupply, "txt", "true", "rand");

//       const tokens = await pumpItFaxt.queryFilter(
//         pumpItFaxt.filters.Launch(acc1.address),
//         0,
//         "latest"
//       );

//       const newTokenAddress = tokens[0].args[1];

//       expect(await pumpItFaxt.isTokenValid(newTokenAddress)).to.equal(true);
//     });

//     it("Should fail if user can not pay deployment charge", async function () {
//       const { pumpItFaxt, acc1, frax } = await loadFixture(
//         deployInterfaceFixture
//       );

//       await pumpItFaxt.setDeploymentCharge(await frax.totalSupply());

//       await frax
//         .connect(acc1)
//         .approve(await pumpItFaxt.getAddress(), await frax.totalSupply());

//       expect(
//         pumpItFaxt.connect(acc1).deployNewToken(initialSupply, "Name", "NM", "")
//       ).to.be.reverted;
//     });
//   });
// });
