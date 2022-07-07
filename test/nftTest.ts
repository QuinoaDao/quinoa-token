import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import {Qui} from "../typechain"
import { EntranceNFT } from "../typechain";

const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')
/***
 * test1 : buyNFT using QUI
 */

 async function getTree() {
    let signers = await ethers.getSigners();
    let accounts = signers.map(signer => signer.address);
    const leaves = accounts.map(account => keccak256(account));
    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    return tree;
  }

async function deployQuiContract(deployer: Signer) {
    const tree = await getTree();
    const root = tree.getRoot();
    const qui= await ethers.getContractFactory("Qui");
    const Qui = await qui.connect(deployer).deploy(4,root);
  
    return await Qui.deployed();
  }

async function deployNFTContract(deployer: Signer) {
    const tree = await getTree();
    const root = tree.getRoot();
    const qui= await ethers.getContractFactory("EntranceNFT");
    const NFT = await qui.connect(deployer).deploy("Example", "EX", root, 100);
  
    return await NFT.deployed();
  }


describe("EntranceNFT Contract", () =>{
    let qui : Qui;
    let nft : EntranceNFT;

    let qui_deployer : Signer;
    let nft_deployer : Signer;

    beforeEach(async () => {
        qui_deployer = (await ethers.getSigners())[0];
        qui = await deployQuiContract(qui_deployer);

        nft_deployer = (await ethers.getSigners())[1];
        nft = await deployNFTContract(nft_deployer);
        await (await nft.setQUiAddress(qui.address)).wait();
    });

    describe("Buy nft with airdropped Qui", () => {
        it("Buy NFT and qui will be burned", async () => {
            let test_signer  = (await ethers.getSigners())[2];
            let mint_tx = await qui.connect(qui_deployer).mint(test_signer.address, 100);
            await mint_tx.wait();
            expect (await qui.balanceOf(test_signer.address)).to.equal(100);

            let buy_tx = await nft.connect(test_signer).buyNFT();
            await buy_tx.wait();
            expect (await qui.balanceOf(test_signer.address)).to.equal(0);
            expect (await nft.balanceOf(test_signer.address)).to.equal(1);
        });
        // it ("Revert when you don't have enough QUI to buy NFT", () => {

        // });
    });

});