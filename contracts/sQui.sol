// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SQuinoa is ERC20, ERC20Burnable, Ownable{

    address public immutable treasury; // immutable ??? 하...ㅠ,ㅠ 

    constructor(address _treasury) ERC20("sQuinoa", "sQui") {
        treasury = _treasury;
    }

    modifier onlyTreasury() {
        _checkTreasury();
        _;
    }

    function _checkTreasury() internal view {
        require(treasury == msg.sender, "onlyTreasury: caller is not the Treasury");
    }

    function setTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function getTreasury() public view returns (address) {
        return treasury;
    }

    // treasury에 qui 맡기면 sQui 민팅해줌 => treasury만 mint 가능
    function mint(address to, uint256 amount) public onlyTreasury {
        _mint(to, amount);
    }

    // transfer 금지
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(to == treasury, "ERC20: transfer to another address"); // member들끼리 서로 transfer할 수 없음. treasury를 통해서만 가능

        super._transfer(from, to, amount);
    }

}