// import { expect } from "chai";
// import { ethers } from "hardhat";
// const keccak256 = require('keccak256')
// const { MerkleTree } = require('merkletreejs')
// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// // qui, squi, treasury, nft 배포
// // setAsset 등등 처리해 줄 것 처리해주기
// // nft airdrop
// // deposit test
// // withdraw test

// describe("Total Test", async () => {
//     async function deployTokenFixture() {
//         let signers = await ethers.getSigners();
//         let accounts = signers.map(signer => signer.address);
//         const leaves = accounts.map(account => keccak256(account));
//         const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
//         const root = tree.getRoot();

//         const Quinoa = await ethers.getContractFactory("Qui");
//         const qui = await Quinoa.deploy(4,root);
//         await qui.deployed();

//         // treasury
//         const Treasury = await ethers.getContractFactory("Treasury");
//         const treasury = await Treasury.deploy();
//         await treasury.deployed();

//         // sQui
//         const SQuinoa = await ethers.getContractFactory("SQuinoa");
//         const sQui = await SQuinoa.deploy(treasury.address);
//         await sQui.deployed();

//         // membership NFT
//         const NFT= await ethers.getContractFactory("EntranceNFT");
//         const nft = await NFT.deploy("Example", "EX", root, 100);
//         await nft.deployed();

//         // treasury; setAsset
//         await treasury.setAsset(qui.address, sQui.address, nft.address);

//         // qui; setTreasuryAddress
//         await qui.setTreasuryAddress(treasury.address);
        
//         // nft; setQUiAddres
//         await nft.setQUiAddress(qui.address);

//         return {tree, root, qui, treasury, sQui, nft};
//     }

//     it("Depoly Test; qui, sQui, treasury, nft", async () => {
//         const {tree, root, qui, treasury, sQui, nft} = await loadFixture(deployTokenFixture);
//     });

//     // 엣 ... 내가 생각한 airdrop이 아니엇음 ㅜ.ㅜ 힝
//     it("Qui test; airdrop qui", async () => {

//     })

//     it("NFT Test; buying NFT", async () => {
//         const {tree, root, qui, treasury, sQui, nft} = await loadFixture(deployTokenFixture);
//         let signers = await ethers.getSigners();

//         for(let i=1; i<100; i++) {
//             let mint_tx = await qui.mint(signers[i].address, 100);
//             await mint_tx.wait();
//             expect(await qui.balanceOf(signers[i].address)).to.be.equal(100);
            
//             let buy_tx = await nft.connect(signers[i]).buyNFT();
//             await buy_tx.wait();
//             expect(await qui.balanceOf(signers[i].address)).to.equal(0);
//             expect(await nft.balanceOf(signers[i].address)).to.equal(1);
//         }
//     });

//     it("Treasury Test; Deposit func", async () => {
//         const {tree, root, qui, treasury, sQui, nft} = await loadFixture(deployTokenFixture);
//         let signer = (await ethers.getSigners())[Math.floor(Math.random() * 100)];

//         let mint_tx = await qui.mint(signer.address, 1000);
//         await mint_tx.wait();
//         expect(await qui.balanceOf(signer.address)).to.be.equal(1000);

//         let buy_tx = await nft.connect(signer).buyNFT();
//         await buy_tx.wait();
//         expect(await qui.balanceOf(signer.address)).to.be.equal(900);
//         expect(await nft.balanceOf(signer.address)).to.be.equal(1);

//         let approve_tx = await qui.connect(signer).approve(treasury.address, 900);
//         let deposit_tx = await treasury.connect(signer).deposit(900);
//         await approve_tx.wait();
//         await deposit_tx.wait();

//         expect(await sQui.balanceOf(signer.address)).to.be.equal(900);
//         expect(await qui.balanceOf(signer.address)).to.be.equal(0);

//     });

//     it("Treasury test: Deposit func with nonDAO member",async () => {
//         const {tree, root, qui, treasury, sQui, nft} = await loadFixture(deployTokenFixture);
//         let signer = (await ethers.getSigners())[Math.floor(Math.random() * 100)];

//         let mint_tx = await qui.mint(signer.address, 1000);
//         await mint_tx.wait();
//         expect(await qui.balanceOf(signer.address)).to.be.equal(1000);

//         let approve_tx = await qui.connect(signer).approve(treasury.address, 900);
//         await approve_tx.wait();

//         expect(treasury.connect(signer).deposit(900))
//             .to.be.revertedWith("onlyDAO: caller is not a DAO member");

//     });

//     it("Treasury Test; Withdraw func", async () => {
//         const {tree, root, qui, treasury, sQui, nft} = await loadFixture(deployTokenFixture);
//         let signer = (await ethers.getSigners())[Math.floor(Math.random() * 100)];

//         let mint_tx = await qui.mint(signer.address, 1000);
//         await mint_tx.wait();
//         expect(await qui.balanceOf(signer.address)).to.be.equal(1000);

//         let buy_tx = await nft.connect(signer).buyNFT();
//         await buy_tx.wait();
//         expect(await qui.balanceOf(signer.address)).to.be.equal(900);
//         expect(await nft.balanceOf(signer.address)).to.be.equal(1);

//         let approve_tx = await qui.connect(signer).approve(treasury.address, 900);
//         let deposit_tx = await treasury.connect(signer).deposit(900);
//         await approve_tx.wait();
//         await deposit_tx.wait();

//         expect(await sQui.balanceOf(signer.address)).to.be.equal(900);
//         expect(await qui.balanceOf(signer.address)).to.be.equal(0);

//         await treasury.connect(signer).withdraw(900);

//         expect(await sQui.balanceOf(signer.address)).to.equal(0);
//         // 900이 아니라 897이 나오는 건 tax 때문인가룡 ..?
//         expect(await qui.balanceOf(signer.address)).to.equal(900);
//     });



// })