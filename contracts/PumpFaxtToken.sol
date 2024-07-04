// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC20withMetadata.sol";
import "./PumpItFaxtInterface.sol";
import "./RAPairDeployer.sol";

contract PumpFaxtToken is ERC20withMetadata, RAPairDeployer {
    uint256 private constant ONE_TOKEN = 1 * (10 ** 18);

    IERC20 private tradedToken;
    IERC20 private frax;
    PumpItFaxtInterface private pumpItFaxt;

    uint256 private _reserve;
    uint256 private _virtualReserve;
    uint256 private _supply;
    uint256 private _displayPrice;

    uint256 private _reserveThreshold;
    uint256 private _finalSupply;

    bool public tradingEnabled = true;

    event Buy(
        uint256 time,
        address indexed buyer,
        uint256 amount,
        uint256 cost
    );
    event Sell(
        uint256 time,
        address indexed seller,
        uint256 amount,
        uint256 refund
    );
    event PriceChange(uint256 time, uint256 value, uint256 marketCap);

    modifier whileTradable() {
        require(tradingEnabled, "Trading can not be done now");
        _;
    }

    constructor(
        address creator_,
        uint256 initialSupply_,
        string memory name_,
        string memory symbol_,
        string memory image_,
        string memory metadata_,
        address fraxAddress_,
        uint256 reserveThreshold_
    )
        ERC20withMetadata(
            creator_,
            initialSupply_,
            name_,
            symbol_,
            image_,
            metadata_
        )
    {
        tradedToken = IERC20(address(this));
        frax = IERC20(fraxAddress_);
        pumpItFaxt = PumpItFaxtInterface(msg.sender);

        _reserveThreshold = reserveThreshold_;
        _finalSupply = initialSupply_;
        _virtualReserve = 15_000 * ONE_TOKEN;
        updateReserveAndSupply();
    }

    function updateReserveAndSupply() private {
        _reserve = _virtualReserve + frax.balanceOf(address(this));
        _supply = balanceOf(address(this));
        _displayPrice = calculateBuyCostByTokenAmount(ONE_TOKEN);

        if (
            marketCap() >= _reserveThreshold &&
            _virtualReserve > 0
        ) {
            tradingEnabled = false;

            uint256 tokensToBeBurnt = calculateTokensReceivedByFraxAmount(
                _virtualReserve
            );

            _burn(address(this), tokensToBeBurnt);
            _virtualReserve = 0;

            // createSelfPairWithBalanceAndBurnLP(
            //     address(this),
            //     address(frax),
            //     _supply,
            //     _reserve
            // );
            updateReserveAndSupply();
        }

        emit PriceChange(block.timestamp, _displayPrice, marketCap());
    }

    function tokenPrice() public view whileTradable returns (uint256) {
        return _displayPrice;
    }

    function marketCap() public view whileTradable returns (uint256) {
        return ((_displayPrice * totalSupply()) / ONE_TOKEN) - _virtualReserve;
    }

    function reserve() public view returns (uint256) {
        return _reserve;
    }

    function supply() public view returns (uint256) {
        return _supply;
    }

    function calculateBuyCostByTokenAmount(
        uint256 amount_
    ) public view whileTradable returns (uint256) {
        if (supply() < amount_) return type(uint256).max;
        return (reserve() * amount_) / (supply() - amount_);
    }

    function calculateSellRefundByTokenAmount(
        uint256 amount_
    ) public view whileTradable returns (uint256) {
        return (reserve() * amount_) / (supply() + amount_);
    }

    function calculateTokensByFraxRefundAmount(
        uint256 amount_
    ) public view whileTradable returns (uint256) {
        if (reserve() < amount_) return type(uint256).max;
        return (supply() * amount_) / (reserve() - amount_);
    }

    function calculateTokensReceivedByFraxAmount(
        uint256 amount_
    ) public view whileTradable returns (uint256) {
        return (supply() * amount_) / (reserve() + amount_);
    }

    function reserveThreshold() public view returns(uint256){
        return _reserveThreshold;
    }

    function buy(
        uint256 amountIn_,
        uint256 amountOutMin_
    ) public whileTradable {
        uint256 amountOutCalculated = calculateTokensReceivedByFraxAmount(
            amountIn_
        );

        require(
            amountOutCalculated > amountOutMin_,
            "Slippage Tolerance Exceeded"
        );

        frax.transferFrom(msg.sender, address(this), amountIn_);
        tradedToken.transfer(msg.sender, amountOutCalculated);

        updateReserveAndSupply();
        emit Buy(block.timestamp, msg.sender, amountOutCalculated, amountIn_);
    }

    function sell(
        uint256 amountIn_,
        uint256 amountOutMin_
    ) public whileTradable {
        uint256 refundCalculated = calculateSellRefundByTokenAmount(amountIn_);

        require(
            refundCalculated > amountOutMin_,
            "Slippage Tolerance Exceeded"
        );

        tradedToken.transferFrom(msg.sender, address(this), amountIn_);
        frax.transfer(msg.sender, refundCalculated);

        updateReserveAndSupply();
        emit Sell(block.timestamp, msg.sender, amountIn_, refundCalculated);
    }
}
