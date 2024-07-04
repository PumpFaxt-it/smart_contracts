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

// describe("PumpFaxtToken", function () {
//   async function deployTokenFixture() {
//     const [owner, acc1, acc2] = await hre.ethers.getSigners();

//     const DummyFrax = await hre.ethers.getContractFactory("DummyFrax");
//     const frax = await DummyFrax.connect(owner).deploy();

//     const PumpFaxtToken = await hre.ethers.getContractFactory("PumpFaxtToken");
//     const token = await PumpFaxtToken.connect(owner).deploy(
//       owner.address,
//       initialSupply,
//       "Pumping Token",
//       "PUMP",
//       imageUrl,
//       `{}`,
//       await frax.getAddress(),
//       69_420_000n * ONE_TOKEN
//     );

//     const bondingCurveAddress = await token.getAddress();

//     await frax
//       .connect(owner)
//       .approve(bondingCurveAddress, await frax.totalSupply());
//     await token
//       .connect(owner)
//       .approve(bondingCurveAddress, await token.totalSupply());

//     return {
//       token,
//       frax,
//       owner,
//       acc1,
//       acc2,
//       bondingCurveAddress,
//     };
//   }

//   describe("Deployment", function () {
//     it("Should transfer total supply to bonding curve (itself)", async function () {
//       const { token, bondingCurveAddress } = await loadFixture(
//         deployTokenFixture
//       );

//       const curveBalance = await token.balanceOf(bondingCurveAddress);
//       const totalSupply = await token.totalSupply();

//       expect(curveBalance).equals(totalSupply);
//     });

//     it("Should return associated image url", async function () {
//       const { token } = await loadFixture(deployTokenFixture);

//       const image = await token.image();

//       expect(image).equals(imageUrl);
//     });

//     it("Should set initial price", async function () {
//       const { token } = await loadFixture(deployTokenFixture);

//       const price = await token.tokenPrice();

//       expect(price).greaterThan(
//       0);

//       await token.buy(100n * ONE_TOKEN, 0);

//       expect(await token.marketCap()).to.greaterThan(0);
//     });
//   });

//   describe("Transactions", function () {
//     it("Should transfer tokens between accounts", async function () {
//       const { token, owner, acc1, acc2 } = await loadFixture(
//         deployTokenFixture
//       );

//       // Purchase tokens from the Bonding Curve
//       await token.connect(owner).buy(50, 0);

//       // Transfer 50 tokens from owner to acc1
//       await token.connect(owner).transfer(acc1.address, 50);
//       expect(await token.balanceOf(acc1.address)).to.equal(50);

//       // Transfer 50 tokens from acc1 to acc2
//       await token.connect(acc1).transfer(acc2.address, 50);
//       expect(await token.balanceOf(acc2.address)).to.equal(50);
//     });

//     it("Should fail if sender does not have enough tokens", async function () {
//       const { token, owner, acc1 } = await loadFixture(deployTokenFixture);
//       const initialOwnerBalance = await token.balanceOf(owner.address);

//       // Try to send 1 token from acc1 (0 tokens) to owner.
//       expect(token.connect(acc1).transfer(owner.address, 1)).to.be.reverted;

//       expect(await token.balanceOf(owner.address)).to.equal(
//         initialOwnerBalance
//       );
//     });

//     it("Should update balances after transfers", async function () {
//       const { token, owner, acc1, acc2 } = await loadFixture(
//         deployTokenFixture
//       );

//       // Purchase tokens from the Bonding Curve
//       await token.connect(owner).buy(300, 0);

//       const initialOwnerBalance = await token.balanceOf(owner.address);

//       // Transfer 100 tokens from owner to acc1
//       await token.transfer(acc1.address, 100);

//       // Transfer another 50 tokens from owner to acc2
//       await token.transfer(acc2.address, 50);

//       // Check balances
//       const finalOwnerBalance = await token.balanceOf(owner.address);
//       expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));

//       const acc1Balance = await token.balanceOf(acc1.address);
//       expect(acc1Balance).to.equal(100);

//       const acc2Balance = await token.balanceOf(acc2.address);
//       expect(acc2Balance).to.equal(50);
//     });
//   });

//   describe("Market Maker", function () {
//     it("Should compute higher prices after each sale", async function () {
//       const { token } = await loadFixture(deployTokenFixture);

//       const history: number[] = [];

//       for (let i = 0; i < 90; i++) {
//         await token.buy(
//           await token.calculateTokensReceivedByFraxAmount(
//             ONE_FRAX * BigInt(5000)
//           ),
//           0
//         );
//         history.push(Number(await token.tokenPrice()) / Number(ONE_TOKEN));
//       }

//       expect(checkSorted(history)).equal(true);
//     });

//     it("Should compute lower prices after refund", async function () {
//       const { token } = await loadFixture(deployTokenFixture);

//       const history: number[] = [];

//       await token.buy(ONE_TOKEN * BigInt(10_000_000), 0);

//       for (let i = 0; i < 100; i++) {
//         await token.sell(ONE_TOKEN * BigInt(100000), 0);
//         history.push(Number(await token.tokenPrice()) / Number(ONE_TOKEN));
//       }

//       expect(checkSorted(history.reverse())).equal(true);
//     });

//     it("Should not affect price significantly after swith from virtual to actual reserve", async function () {
//       const { token } = await loadFixture(deployTokenFixture);

//       await token.buy(
//         await token.calculateTokensReceivedByFraxAmount(
//           reserveThreshold - BigInt(10)
//         ),
//         0
//       );

//       const beforePrice = await token.tokenPrice();

//       await token.buy(
//         await token.calculateTokensReceivedByFraxAmount(BigInt(20)),
//         0
//       );

//       const afterPrice = await token.tokenPrice();

//       expect(beforePrice).to.be.approximately(
//         afterPrice,
//         ONE_FRAX / BigInt(10_000)
//       );
//     });
//   });
// });
