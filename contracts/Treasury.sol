// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ITreasury.sol";
import "./ISQuinoa.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Treasury is ITreasury, Ownable {
    IERC20 public qui;
    ISQuinoa public sQui;

    function setAsset(address _qui, address _sQui) public onlyOwner {
        qui = IERC20(_qui);
        sQui = ISQuinoa(_sQui);
    }

    // deposit(staking) => qui를 staking하고 sQui를 그 만큼 민팅 받음
    function deposit(address user, uint256 amount) external override {
        qui.transfer(address(this), amount); // msg.sender -(qui)-> treasury
        sQui.mint(user, amount); // 0x0 -(sQui)-> user

        emit Deposit(user, amount);
    }

    // sQui를 amount만큼 burn 하고, 그 만큼 qui를 돌려줌
    function withdraw(uint256 amount) external override {
        require(sQui.balanceOf(_msgSender()) >= amount, "Treasury: withdraw amount exceeds sQui balance");
        
        sQui.burn(_msgSender(), amount); // msg.sender() -(sQui)-> 0x0
        qui.approve(_msgSender(), amount); // withdraw를 호출한 사람에게 이 contract의 qui를 approve
        qui.transferFrom(address(this), _msgSender(), amount); // treasury -(qui)-> msg.sender
        
        emit Withdraw(_msgSender(), amount);
    }

}