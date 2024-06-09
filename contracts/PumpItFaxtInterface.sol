// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC20BondingCurve.sol";

contract PumpItFaxtInterface is Ownable {
    mapping(address => bool) private _validTokens;
    IERC20 private frax;
    uint256 private _deploymentCharge = 0;

    event Launch(address indexed creator, address token);

    constructor(address fraxAddress_) Ownable(msg.sender) {
        frax = IERC20(fraxAddress_);
    }

    function deployNewToken(
        uint256 initialSupply_,
        string calldata name_,
        string calldata symbol_,
        string calldata image_
    ) public returns (address) {
        require(
            frax.transferFrom(msg.sender, address(this), _deploymentCharge)
        );

        ERC20BondingCurve newToken = new ERC20BondingCurve(
            msg.sender,
            initialSupply_,
            name_,
            symbol_,
            image_,
            address(frax)
        );
        address newTokenAddress = address(newToken);

        _validTokens[newTokenAddress] = true;

        emit Launch(msg.sender, newTokenAddress);

        return newTokenAddress;
    }

    function deploymentCharge() public view returns (uint256) {
        return _deploymentCharge;
    }

    function setDeploymentCharge(uint256 newCharge_) public onlyOwner {
        _deploymentCharge = newCharge_;
    }

    function withdraw(address addr_, uint256 amount_) public onlyOwner {
        frax.transfer(addr_, amount_);
    }

    function isTokenValid(address addr_) public view returns (bool) {
        return _validTokens[addr_];
    }
}
