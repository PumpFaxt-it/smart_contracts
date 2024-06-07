// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC20withImage.sol";

contract ERC20BondingCurve is ERC20withImage {
    IERC20 public tradedToken;
    IERC20 public frax;

    event Buy(address indexed buyer, uint256 amount, uint256 cost);
    event Sell(address indexed seller, uint256 amount, uint256 refund);

    constructor(
        uint256 initialSupply_,
        string memory name_,
        string memory symbol_,
        string memory image_,
        address fraxAddress_
    ) ERC20withImage(initialSupply_, name_, symbol_, image_, address(this)) {
        tradedToken = IERC20(address(this));
        frax = IERC20(fraxAddress_);
    }

    function tokenPrice() public view returns (uint256) {
        return calculateBuyCostByTokenAmount(1);
    }

    function calculateBuyCostByTokenAmount(
        uint256 amount_
    ) public view returns (uint256) {
        uint256 supply = tradedToken.balanceOf(address(this));
        uint256 reserve = frax.balanceOf(address(this));

        return (reserve * amount_) / (supply - amount_);
    }

    function calculateSellRefundByTokenAmount(
        uint256 amount_
    ) public view returns (uint256) {
        uint256 supply = tradedToken.balanceOf(address(this));
        uint256 reserve = frax.balanceOf(address(this));

        return (reserve * amount_) / (supply + amount_);
    }

    function calculatePurchasedTokensByFraxAmount(
        uint256 amount_
    ) public view returns (uint256) {
        uint256 supply = tradedToken.balanceOf(address(this));
        uint256 reserve = frax.balanceOf(address(this));

        return (supply * amount_) / (reserve + amount_);
    }

    function calculateTokensToBeSoldByFraxAmount(
        uint256 amount_
    ) public view returns (uint256) {
        uint256 supply = tradedToken.balanceOf(address(this));
        uint256 reserve = frax.balanceOf(address(this));

        return (supply * amount_) / (amount_ - reserve);
    }

    function buy(uint256 amount_) public {
        uint256 cost = calculateBuyCostByTokenAmount(amount_);

        require(
            frax.transferFrom(msg.sender, address(this), cost),
            "FRAX transfer failed"
        );
        require(
            tradedToken.transfer(msg.sender, amount_),
            "Token transfer failed"
        );

        emit Buy(msg.sender, amount_, cost);
    }

    function sell(uint256 amount_) public {
        uint256 refund = calculateSellRefundByTokenAmount(amount_);

        require(
            tradedToken.transferFrom(msg.sender, address(this), amount_),
            "Token transfer failed"
        );
        require(frax.transfer(msg.sender, refund), "FRAX transfer failed");

        emit Sell(msg.sender, amount_, refund);
    }
}
