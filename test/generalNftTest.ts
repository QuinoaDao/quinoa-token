import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import {Qui} from "../typechain";
import { GeneralNFT } from "../typechain";

const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')


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

