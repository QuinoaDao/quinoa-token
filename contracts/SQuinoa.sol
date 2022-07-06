// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/context.sol";

import "./ISQuinoa.sol";

contract SQuinoa is ISQuinoa, ERC20, ERC20Burnable, Context{

    address public immutable treasury; 

    constructor(address _treasury) ERC20("sQuinoa", "sQui") {
        treasury = _treasury;
    }

    modifier onlyTreasury() {
        require(treasury == _msgSender(), "onlyTreasury: caller is not the Treasury");
        _;
    }

    // treasury에 qui 맡기면 sQui 민팅해줌 => treasury만 mint 가능
    function mint(address to, uint256 amount) public onlyTreasury {
        _mint(to, amount);
    }

    // msg.sender(=> treasury)의 sQui를 amount만큼 소각
    function burn(uint256 amount) public override onlyTreasury {
        super.burn(amount);
    }

    // account의 sQui를 amount만큼 소각(단, msg.sender에게 approve 되어 있어야 함)
    function burnFrom(address account, uint256 amount) public override onlyTreasury {
        super.burnFrom(account, amount);
    }

    // transfer 금지
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        revert("sQui Token cannot transfer");
    }

}