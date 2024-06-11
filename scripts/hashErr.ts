import { ethers } from "hardhat";
let selector = ethers.id("ERC20InsufficientBalance(address,uint,uint)").slice(0, 10);
console.log(selector);
