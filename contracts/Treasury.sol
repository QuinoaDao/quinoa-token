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

    function getAsset() public view returns(address, address) {
        return (address(qui), address(sQui));
    }
    
    // deposit(staking) => qui를 staking하고 sQui를 그 만큼 민팅 받음
    // -> 우선, user가 Treasury contract에게 미리 approve를 해 놓아야 함
    // 여러 페이지 봐봤는데, 보통 deposit 하기 전에 따로 approve를 해주더라구 ~ 
    // 그래서 우리도 그렇게 화면에 미리 approve를 해 주고, deposit 할 수 있게 해둬야 할 듯
    function deposit(uint256 amount) external override {
        qui.transferFrom(_msgSender(), address(this), amount); // user -(qui)-> treasury
        sQui.mint(_msgSender(), amount); // 0x0 -(sQui)-> user

        emit Deposit(_msgSender(), amount);
    }

    // sQui를 amount만큼 burn 하고, 그 만큼 qui를 돌려줌
    function withdraw(uint256 amount) external override {
        require(sQui.balanceOf(_msgSender()) >= amount, "Treasury: withdraw amount exceeds sQui balance");
        
        sQui.burn(_msgSender(), amount); // msg.sender() -(sQui)-> 0x0
        qui.transfer(_msgSender(), amount); // treasury -(qui)-> msg.sender
        
        emit Withdraw(_msgSender(), amount);
    }

}