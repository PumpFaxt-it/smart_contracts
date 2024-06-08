// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC20withImage.sol";
import "./PumpItFaxtInterface.sol";

contract ERC20BondingCurve is ERC20withImage {
    IERC20 private tradedToken;
    IERC20 private frax;
    PumpItFaxtInterface private pumpItFaxt;

    address private _creator;
    uint256 private _reserve;
    uint256 private _virtualReserve;
    uint256 private _supply;
    uint256 private _displayPrice;

    uint256 private _reserveThreshold = 69420 * (10 ** 18);

    event Buy(address indexed buyer, uint256 amount, uint256 cost);
    event Sell(address indexed seller, uint256 amount, uint256 refund);
    event PriceChange(uint256 timestamp, uint256 price, uint256 marketCap);

    constructor(
        address creator_,
        uint256 initialSupply_,
        string memory name_,
        string memory symbol_,
        string memory image_,
        address fraxAddress_
    )
        ERC20withImage(
            (initialSupply_ * 10000) / 5771,
            name_,
            symbol_,
            image_,
            address(this)
        )
    {
        tradedToken = IERC20(address(this));
        frax = IERC20(fraxAddress_);
        pumpItFaxt = PumpItFaxtInterface(msg.sender);

        _creator = creator_;
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

        updateReserveAndSupply();
        emit Buy(msg.sender, amount_, cost);
    }

    function sell(uint256 amount_) public {
        uint256 refund = calculateSellRefundByTokenAmount(amount_);

        require(
            tradedToken.transferFrom(msg.sender, address(this), amount_),
            "Token transfer failed"
        );
        require(frax.transfer(msg.sender, refund), "FRAX transfer failed");

        updateReserveAndSupply();
        emit Sell(msg.sender, amount_, refund);
    }
}
