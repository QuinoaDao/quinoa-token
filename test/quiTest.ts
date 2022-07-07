import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import {Qui} from "../typechain"

const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')
/***
 * test1 : only owner can mint token, change owner, change tax, change treasury address
 * test2 : transfer works fine and fee is stored in treasury
 * test3 : airdrop
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
  
describe("Qui Contract", async () =>{
    let contract : Qui;
    let deployer : Signer;
    let treasury : string = (await ethers.getSigners())[1].address;
    
    beforeEach(async () => {
        deployer = (await ethers.getSigners())[0];
        contract = await deployQuiContract(deployer);
    })

    describe("Only owner function", () => {
        it ("only owner can mint token", async() => {
            let test_signer = (await ethers.getSigners())[10];
            let test_addr = test_signer.address;
            await expect(contract.connect(test_signer).mint(await deployer.getAddress(),10))
            .to.be.revertedWith("Ownable: caller is not the owner");

            const tx = await contract.connect(deployer).mint(test_addr, 10);
            await tx.wait();
            expect (await contract.balanceOf(test_addr)).to.equal(10);

        });
        it ("only owner can change owner", async() => {
            let new_owner = (await ethers.getSigners())[15].address;
            let test_addr = (await ethers.getSigners())[10].address;
            const tx = await contract.connect(deployer).changeOwner(new_owner);
            await tx.wait(); 

            await expect(contract.connect(deployer).mint(test_addr,10))
                .to.be.revertedWith("Ownable: caller is not the owner");

        });
    });

    describe
  });