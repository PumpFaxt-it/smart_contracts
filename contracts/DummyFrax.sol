// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyFrax is ERC20 {
    constructor() ERC20("Frax", "FRAX") {
        _mint(msg.sender, 640_000_000 * (10 ** 18));
    }
}
