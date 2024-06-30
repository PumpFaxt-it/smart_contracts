// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UsernameRental is Ownable {
    mapping(address => string) private _usernamesMapping;
    mapping(address => uint256) private _expiryMapping;

    IERC20 private frax;

    constructor(address fraxAddress_) Ownable(msg.sender) {
        frax = IERC20(fraxAddress_);
    }

    function username(address user_) public view returns (string memory) {
        return _usernamesMapping[user_];
    }

    function getDisplayName(address user_) public view returns (string memory) {
        if (_expiryMapping[user_] > block.timestamp)
            return _usernamesMapping[user_];
        else return addressToString(user_);
    }

    function registerUserame(string memory username_) public {
        frax.transferFrom(msg.sender, address(this), 5 * (10**18));

        _usernamesMapping[msg.sender] = username_;
        _expiryMapping[msg.sender] = block.timestamp + 365 days;
    }

    function addressToString(address _addr)
        internal
        pure
        returns (string memory)
    {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
