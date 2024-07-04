import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { checkSorted } from "../utils";

const imageUrl =
  "https://assets.raribleuserdata.com/prod/v1/image/t_image_big/aHR0cHM6Ly9pcGZzLnJhcmlibGV1c2VyZGF0YS5jb20vaXBmcy9RbVRBSFVMQ0QydVVYVE05c2hBZHpOVGZZWGlnanVyWjl2VFZnQ29TMXd2QURVL2ltYWdlLmpwZWc=";
const ONE_TOKEN = BigInt(Math.pow(10, 18));
const ONE_FRAX = BigInt(Math.pow(10, 18));

const initialSupply = BigInt(1_000_000_000);
const reserveThreshold = BigInt(69_420) * ONE_FRAX;

function displayTokens(num: number | bigint) {
  console.log(Number(num) / Number(ONE_TOKEN));
}

describe("PumpFaxtToken", function () {
  async function deployTokenFixture() {
    const [owner, acc1, acc2] = await hre.ethers.getSigners();

    const DummyFrax = await hre.ethers.getContractFactory("DummyFrax");
    const frax = await DummyFrax.connect(owner).deploy();

    const PumpFaxtToken = await hre.ethers.getContractFactory("PumpFaxtToken");
    const token = await PumpFaxtToken.connect(owner).deploy(
      owner.address,
      initialSupply,
      "Pumping Token",
      "PUMP",
      imageUrl,
      `{}`,
      await frax.getAddress(),
      reserveThreshold
    );

    const bondingCurveAddress = await token.getAddress();

    await frax
      .connect(owner)
      .approve(bondingCurveAddress, await frax.totalSupply());
    await token
      .connect(owner)
      .approve(bondingCurveAddress, await token.totalSupply());

    return {
      token,
      frax,
      owner,
      acc1,
      acc2,
      bondingCurveAddress,
    };
  }

  describe("Deployment", function () {
    it("Test", async function () {
      const { token, bondingCurveAddress } = await loadFixture(
        deployTokenFixture
      );

      displayTokens(await token.tokenPrice());
      displayTokens(await token.marketCap());

      await token.buy(10n * ONE_FRAX, 0);

      displayTokens(await token.tokenPrice());
      displayTokens(await token.marketCap());
    });
  });
});
