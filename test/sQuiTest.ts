import { expect } from "chai";
import { ethers } from "hardhat";


// ** sQui **
// 1. 유저들끼리 sQui를 거래할 때 잘 revert 되는가 ?
// 2. Treasury가 아닌 다른 사람이 민팅하려고 할 때 잘 revert 되는가 ?
// 3. Treasury가 아닌 다른 사람이 소각하려고 할 때 잘 revert 되는가 ?
// Q. _mint와 _burn을 다른 사람이 상속해서 Override 할 수 있지 않나 ? 흠