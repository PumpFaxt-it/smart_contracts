// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20withImage is ERC20 {
    string private _image;
    uint8 private _decimals = 6;

    constructor(
        uint256 initialSupply_,
        string memory name_,
        string memory symbol_,
        string memory image_,
        address holder_
    ) ERC20(name_, symbol_) {
        _image = image_;
        _mint(holder_, initialSupply_ * (10 ** _decimals));
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Returns the image of the token.
     */
    function image() public view virtual returns (string memory) {
        return _image;
    }
}
