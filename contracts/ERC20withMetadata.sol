// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20withMetadata is ERC20 {
    string private _image;
    address private _creator;
    string private _metadata;
    uint8 private _decimals = 18;

    constructor(
        address creator_,
        uint256 initialSupply_,
        string memory name_,
        string memory symbol_,
        string memory image_,
        address holder_
    ) ERC20(name_, symbol_) {
        _creator = creator_;
        _image = image_;
        _mint(holder_, initialSupply_ * (10 ** _decimals));
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function image() public view virtual returns (string memory) {
        return _image;
    }

    function metadata() public view virtual returns (string memory) {
        return _metadata;
    }

    function setMetadata(string memory metadata_) public virtual {
        _metadata = metadata_;
    }
}
