// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./ISQuinoa.sol";

contract SQuinoa is ISQuinoa, ERC20{

    address public immutable treasury; 

    constructor(address _treasury) ERC20("sQuinoa", "sQui") {
        treasury = _treasury;
    }

    modifier onlyTreasury() {
        require(treasury == _msgSender(), "onlyTreasury: caller is not the Treasury");
        _;
    }

    // treasury에 qui 맡기면 sQui 민팅해줌 => treasury만 mint 가능
    function mint(address to, uint256 amount) external override onlyTreasury {
        _mint(to, amount);
    }

    // account의 sQui를 amount만큼 소각(단, msg.sender에게 approve 되어 있어야 함)
    // => burnable의 burnFrom과 같은 기능&로직
    function burn(address account, uint256 amount) external override onlyTreasury {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    // transfer 금지
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(false, "sQuinao Token cannot transfer");
        super._transfer(from, to, amount);
    }

}