import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import {Qui} from "../typechain"
import { GuruNFT } from "../typechain";

const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

/** SOULBOUND TEST
 * Get airdropped guru nft
 * you should FAIL to transfer nft 
 */

 async function getTree() {
    let signers = await ethers.getSigners();
    let accounts = signers.map(signer => signer.address);
    const leaves = accounts.map(account => keccak256(account));
    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    return tree;
  }

  async function deployNFTContract(deployer: Signer) {
    const tree = await getTree();
    const root = tree.getRoot();
    const nftFactory= await ethers.getContractFactory("GuruNFT");
    const nft = await nftFactory.connect(deployer).deploy(root);
  
    return await nft.deployed();
  }

  describe ("SOULBOUND NFT TEST", () => {
    let nft : GuruNFT;
    let nft_deployer : Signer;

    beforeEach(async () => {
        nft_deployer = (await ethers.getSigners())[1];
        nft = await deployNFTContract(nft_deployer);
    });
    it("Cannot transfer GuruNFT ", async () => {
      let test_signer  = (await ethers.getSigners())[2];
      const tree = await getTree();
      const proof = tree.getHexProof(keccak256(test_signer.address));

      let airdrop_tx = await nft.connect(test_signer).airdrop(proof, test_signer.address);
      await airdrop_tx.wait();
      // expect to get nft
      expect (await nft.balanceOf(test_signer.address)).to.equal(1);

      let signer  = (await ethers.getSigners())[3];
      let tokenID = await nft.getTokenId(test_signer.address);
      expect(nft.transferFrom(test_signer.address, signer.address, tokenID))
      .to.be.reverted;

    });
      

  });
