import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const imageUrl =
  "https://assets.raribleuserdata.com/prod/v1/image/t_image_big/aHR0cHM6Ly9pcGZzLnJhcmlibGV1c2VyZGF0YS5jb20vaXBmcy9RbVRBSFVMQ0QydVVYVE05c2hBZHpOVGZZWGlnanVyWjl2VFZnQ29TMXd2QURVL2ltYWdlLmpwZWc=";
const initialSupply = 69_420_000;
const initialFraxReserve = 3 * Math.pow(10, 18);

describe("ERC20BondingCurve", function () {
  async function deployTokenFixture() {
    const [owner, acc1, acc2] = await hre.ethers.getSigners();

    const DummyFrax = await hre.ethers.getContractFactory("DummyFrax");
    const frax = await DummyFrax.connect(owner).deploy();

    const ERC20BondingCurve = await hre.ethers.getContractFactory(
      "ERC20BondingCurve"
    );
    const token = await ERC20BondingCurve.connect(owner).deploy(
      initialSupply,
      "Pumping Token",
      "PUMP",
      imageUrl,
      await frax.getAddress()
    );

    const bondingCurveAddress = await token.getAddress();

    frax.connect(owner).approve(bondingCurveAddress, await frax.totalSupply());
    token
      .connect(owner)
      .approve(bondingCurveAddress, await token.totalSupply());

    frax.connect(owner).transfer(bondingCurveAddress, initialFraxReserve);

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
    it("should transfer total supply to bonding curve (itself)", async function () {
      const { token, bondingCurveAddress } = await loadFixture(
        deployTokenFixture
      );

      const curveBalance = await token.balanceOf(bondingCurveAddress);
      const totalSupply = await token.totalSupply();

      expect(curveBalance).equals(totalSupply);
    });

    it("Should return associated image url", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      const image = await token.image();

      expect(image).equals(imageUrl);
    });

    it("Should set initial price", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      const price = await token.tokenPrice();

      expect(price).equals(Math.floor(initialFraxReserve / initialSupply));
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, frax, owner, acc1, acc2 } = await loadFixture(
        deployTokenFixture
      );

      // Purchase tokens from the Bonding Curve
      await token.connect(owner).buy(50);

      // Transfer 50 tokens from owner to acc1
      await token.connect(owner).transfer(acc1.address, 50);
      expect(await token.balanceOf(acc1.address)).to.equal(50);

      // Transfer 50 tokens from acc1 to acc2
      await token.connect(acc1).transfer(acc2.address, 50);
      expect(await token.balanceOf(acc2.address)).to.equal(50);
    });

    it("Should fail if sender does not have enough tokens", async function () {
      const { token, owner, acc1 } = await loadFixture(deployTokenFixture);
      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Try to send 1 token from acc1 (0 tokens) to owner.
      token.connect(acc1).transfer(owner.address, 1);

      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const { token, owner, acc1, acc2 } = await loadFixture(
        deployTokenFixture
      );

      // Purchase tokens from the Bonding Curve
      await token.connect(owner).buy(300);

      const initialOwnerBalance = await token.balanceOf(owner.address);

      // Transfer 100 tokens from owner to acc1
      await token.transfer(acc1.address, 100);

      // Transfer another 50 tokens from owner to acc2
      await token.transfer(acc2.address, 50);

      // Check balances
      const finalOwnerBalance = await token.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));

      const acc1Balance = await token.balanceOf(acc1.address);
      expect(acc1Balance).to.equal(100);

      const acc2Balance = await token.balanceOf(acc2.address);
      expect(acc2Balance).to.equal(50);
    });
  });

  describe("Market Maker", function () {
    it("Should set initial price", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      const image = await token.image();

      expect(image).equals(imageUrl);
    });
  });
});
