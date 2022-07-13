import { ethers } from "hardhat";
const keccak256 = require('keccak256')
const { MerkleTree } = require('merkletreejs')

async function main() {
  // We get the contract to deploy

  // qui
  let signers = await ethers.getSigners();
  let accounts = signers.map(signer => signer.address);
  const leaves = accounts.map(account => keccak256(account));
  const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
  const root = tree.getRoot();

  const Quinoa = await ethers.getContractFactory("Qui");
  const quinoa = await Quinoa.deploy(4,root);
  await quinoa.deployed();

  // treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();

  // sQui
  const SQuinoa = await ethers.getContractFactory("SQuinoa");
  const sQuinoa = await SQuinoa.deploy(treasury.address);
  await sQuinoa.deployed();

  // membership NFT
  const NFT= await ethers.getContractFactory("EntranceNFT");
  const nft = await NFT.deploy("Example", "EX", root, 100);
  await nft.deployed();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
