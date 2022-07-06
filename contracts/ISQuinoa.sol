// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISQuinoa is IERC20 {

    event Mint(address to, uint256 amount);

    event Burn(address owner, uint256 amount);

    function mint(address to, uint256 amount) public;

    function burn(uint256 amount) public;

    function burnFrom(address account, uint256 amount) public;
}