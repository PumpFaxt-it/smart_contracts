// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRAPairFactory {
    function addLiquidity(
        address TokenA,
        address TokenB,
        bool stable,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external;
}

contract RAPairDeployer {
    IRAPairFactory private _pairFactory = IRAPairFactory(0xAAA16c016BF556fcD620328f0759252E29b1AB57);

    function createSelfPairWithBalanceAndBurnLP(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) internal {
        _pairFactory.addLiquidity(
            tokenA,
            tokenB,
            false,
            amountA,
            amountB,
            (amountA * 98) / 100,
            (amountB * 98) / 100,
            address(0),
            block.timestamp + 1 days
        );
    }
}
