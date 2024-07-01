// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UsernameRental is Ownable {
    mapping(address => string) private _usernamesMapping;
    mapping(address => uint256) private _expiryMapping;
    mapping(string => address) private _availabilityMapping;

    IERC20 private frax;
    uint256 public fee = 5 * (10 ** 18); // Default fee in FRAX

    event UsernameRegistered(
        address indexed user,
        string username,
        uint256 expiryTime
    );
    event UsernameRenewed(
        address indexed user,
        string username,
        uint256 newExpiryTime
    );
    event FeeUpdated(uint256 newFee);

    constructor(address fraxAddress_) {
        frax = IERC20(fraxAddress_);
    }

    function username(address user_) public view returns (string memory) {
        return _usernamesMapping[user_];
    }

    function getDisplayName(address user_) public view returns (string memory) {
        if (_expiryMapping[user_] > block.timestamp) {
            return _usernamesMapping[user_];
        } else {
            return addressToString(user_);
        }
    }

    function registerUsername(string memory username_) public {
        require(
            _expiryMapping[msg.sender] < block.timestamp,
            "You already have a valid username"
        );
        require(
            _availabilityMapping[username_] == address(0) ||
                _expiryMapping[_availabilityMapping[username_]] <
                block.timestamp,
            "Username already taken"
        );

        frax.transferFrom(msg.sender, address(this), fee);

        _usernamesMapping[msg.sender] = username_;
        _expiryMapping[msg.sender] = block.timestamp + 365 days;
        _availabilityMapping[username_] = msg.sender;

        emit UsernameRegistered(
            msg.sender,
            username_,
            _expiryMapping[msg.sender]
        );
    }

    function renewUsername() public {
        require(
            _expiryMapping[msg.sender] > block.timestamp,
            "No valid username to renew"
        );

        frax.transferFrom(msg.sender, address(this), fee);
        _expiryMapping[msg.sender] += 365 days;

        emit UsernameRenewed(
            msg.sender,
            _usernamesMapping[msg.sender],
            _expiryMapping[msg.sender]
        );
    }

    function setFee(uint256 newFee) public onlyOwner {
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    function addressToString(
        address _addr
    ) internal pure returns (string memory) {
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
