// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC20withMetadata.sol";
import "./PumpItFaxtInterface.sol";

contract ERC20BondingCurve is ERC20withMetadata {
    IERC20 private tradedToken;
    IERC20 private frax;
    PumpItFaxtInterface private pumpItFaxt;

    uint256 private _reserve;
    uint256 private _virtualReserve;
    uint256 private _supply;
    uint256 private _displayPrice;

    uint256 private _reserveThreshold = 69420 * (10 ** 18);

    event Buy(address indexed buyer, uint256 amount, uint256 cost);
    event Sell(address indexed seller, uint256 amount, uint256 refund);
    event PriceChange(uint256 time, uint256 value, uint256 marketCap);

    constructor(
        address creator_,
        uint256 initialSupply_,
        string memory name_,
        string memory symbol_,
        string memory image_,
        string memory metadata_,
        address fraxAddress_
    )
        ERC20withMetadata(
            creator_,
            (initialSupply_ * 10000) / 5771,
            name_,
            symbol_,
            image_,
            metadata_
        )
    {
        tradedToken = IERC20(address(this));
        frax = IERC20(fraxAddress_);
        pumpItFaxt = PumpItFaxtInterface(msg.sender);

        _virtualReserve = _reserveThreshold * 2;
        updateReserveAndSupply();
    }

    function updateReserveAndSupply() private {
        _reserve = _virtualReserve + frax.balanceOf(address(this));
        _supply = balanceOf(address(this));
        _displayPrice = calculateBuyCostByTokenAmount(1 * (10 ** decimals()));

        if (_reserve >= _reserveThreshold * 3 && _virtualReserve > 0) {
            _virtualReserve = 0;
            _burn(address(this), (_supply * 2) / 3);
            updateReserveAndSupply();
        }

        emit PriceChange(
            block.timestamp,
            _displayPrice,
            frax.balanceOf(address(this))
        );
    }

    function tokenPrice() public view returns (uint256) {
        return _displayPrice;
    }

    function marketCap() public view returns (uint256) {
        return frax.balanceOf(address(this));
    }

    function reserve() public view returns (uint256) {
        return _reserve;
    }

    function supply() public view returns (uint256) {
        return _supply;
    }

    function calculateBuyCostByTokenAmount(
        uint256 amount_
    ) public view returns (uint256) {
        return (reserve() * amount_) / (supply() - amount_);
    }

    function calculateSellRefundByTokenAmount(
        uint256 amount_
    ) public view returns (uint256) {
        return (reserve() * amount_) / (supply() + amount_);
    }

    function calculateTokensByFraxRefundAmount(
        uint256 amount_
    ) public view returns (uint256) {
        return (supply() * amount_) / (reserve() - amount_);
    }

    function calculateTokensReceivedByFraxAmount(
        uint256 amount_
    ) public view returns (uint256) {
        return (supply() * amount_) / (reserve() + amount_);
    }

    function buy(uint256 amountIn_, uint256 amountOutMin_) public {
        uint256 amountOutCalculated = calculateTokensReceivedByFraxAmount(amountIn_);

        require(amountOutCalculated  > amountOutMin_, "Slippage Tolerance Exceeded");

        frax.transferFrom(msg.sender, address(this), amountIn_);
        tradedToken.transfer(msg.sender, amountOutCalculated);

        updateReserveAndSupply();
        emit Buy(msg.sender, amountOutCalculated, amountIn_);
    }

    function sell(uint256 amountIn_, uint256 amountOutMin_) public {
        uint256 refundCalculated = calculateSellRefundByTokenAmount(amountIn_);

        require(refundCalculated  > amountOutMin_, "Slippage Tolerance Exceeded");

        tradedToken.transferFrom(msg.sender, address(this), amountIn_);
        frax.transfer(msg.sender, refundCalculated);

        updateReserveAndSupply();
        emit Sell(msg.sender, amountIn_, refundCalculated);
    }
}
