// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC20BondingCurve.sol";

contract PumpItFaxtInterface {
    ERC20BondingCurve[] private _tokens;
    mapping(address => bool) private _validTokens;
    IERC20 private frax;
    uint256 private _deploymentCharge;

    event Launch(address);

    constructor(address fraxAddress_) {
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
            initialSupply_,
            name_,
            symbol_,
            image_,
            address(frax)
        );
        address newTokenAddress = address(newToken);

        _tokens.push(newToken);
        _validTokens[newTokenAddress] = true;

        emit Launch(newTokenAddress);

        return newTokenAddress;
    }

    function deploymentCharge() public view returns (uint256) {
        return _deploymentCharge;
    }

    function isTokenValid(address addr_) public view returns (bool) {
        return _validTokens[addr_];
    }
}