import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import {Qui, Treasury} from "../typechain";
import { GeneralNFT } from "../typechain";

const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

/** GenralNFT Test
 * 0. Buy NFT then qui will be burned and balance of NFT is 1
 * 1. Check Royalty info from NFT 
 * 2. NFT is transferable
 */

 async function getTree() {
    let signers = await ethers.getSigners();
    let accounts = signers.map(signer => signer.address);
    const leaves = accounts.map(account => keccak256(account));
    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    return tree;
  }

async function deployContracts(quiOwner:Signer, treasuryOwner:Signer, nftOwner:Signer) {
  const Qui = await ethers.getContractFactory("Qui");
  const tree = await getTree();
  const qui = await Qui.connect(quiOwner).deploy(10, tree.getRoot());
  await qui.deployed();

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.connect(treasuryOwner).deploy();
  await treasury.deployed();

  const NFT = await ethers.getContractFactory("GeneralNFT");
  const nft = await NFT.connect(nftOwner).deploy(100, 10, treasury.address );
  await nft.deployed();

  return {qui, treasury, nft}
}

describe("GeneralNFT", function () {
  describe("Buy NFT", async () => {
    it("buy nft and qui is burned", async () => {
      const [quiOwner, treasuryOwner, nftOwner, user1, user2] = await ethers.getSigners();
      const {qui, nft} = await deployContracts(quiOwner, treasuryOwner, nftOwner);

      await nft.connect(nftOwner).setQUiAddress(qui.address);

      //approve nft contract to burn qui
      await qui.connect(user1).approve(nft.address, 300);
      await qui.connect(quiOwner).mint(user1.address, 200);
      await nft.connect(user1).buy();

      expect (await nft.balanceOf(user1.address)).to.equal(1);
      expect( await qui.balanceOf(user1.address)).to.equal(100);
    });
  })
})

