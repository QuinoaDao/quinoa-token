// SPDX-License-Identifier : MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract QuinoaTest is ERC20 {
    constructor() ERC20("QuinoaTest", "quiTest") {}

    function mint(address to, uint amount) public {
        _mint(to, amount);
    }
}