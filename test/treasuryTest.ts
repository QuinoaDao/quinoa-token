import { expect } from "chai";
import { ethers } from "hardhat";


// ** Treasury **
// 0. Treasury의 setAsset이 잘 되는지 ?
// 1. qui를 staking 하면 sQui가 1:1로 나오는가 (1번)
// 2. qui를 staking 하면 sQui가 1:1로 나오는가 (여러 번)
// 3. sQui를 withdraw 하면 sQui가 1:1로 잘 소각되는 가 + qui가 들어오는 가 (1번)
// 4. sQui를 withdraw 하면 sQui가 1:1로 잘 소각되는 가 + qui가 들어오는 가 (여러번)


async function deployContracts() {
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();

  const QuinoaTest = await ethers.getContractFactory("QuinoaTest");
  const quinoaTest = await QuinoaTest.deploy();
  await quinoaTest.deployed();

  const sQuinoa = await ethers.getContractFactory("SQuinoa");
  const squinoa = await sQuinoa.deploy(treasury.address);
  await squinoa.deployed();

  return {treasury, quinoaTest, squinoa}
}

describe("Treasury", function () {

  describe("setAsset", () => {
    // 1. treasury의 setAsset이 잘 되는지 ?
    it("test setAsset func", async () => {
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);
      
      let quiAddr;
      let sQuiAddr;
      [quiAddr, sQuiAddr] = await treasury.getAsset();

      expect(quiAddr).be.equal(quinoaTest.address);
      expect(sQuiAddr).be.equal(squinoa.address);
    })

    it("only owner can call setAsset func", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();

      expect(treasury.connect(addr1).setAsset(quinoaTest.address, squinoa.address)).to.be.reverted;
    });
  });
  
  describe("deposit", async () => {
    it("test deposit(staking) func", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);

      // 먼저, qui가 있어야 함
      await quinoaTest.connect(addr1).mint(addr1.address, 1000);
      await quinoaTest.connect(addr1).approve(treasury.address, 1000);
      
      // 그 다음 deposit
      await treasury.connect(addr1).deposit(1000);

      expect(await squinoa.balanceOf(addr1.address)).to.equal(1000);
      
    });

    it("test deposit(staking) func * 20", async () => {
      const addrs = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);

      for (let i=0; i<addrs.length; i++){
        // 먼저, qui가 있어야 함
        await quinoaTest.connect(addrs[i]).mint(addrs[i].address, 1000);
        await quinoaTest.connect(addrs[i]).approve(treasury.address, 1000);
        
        // 그 다음 deposit
        await treasury.connect(addrs[i]).deposit(1000);

        expect(await squinoa.balanceOf(addrs[i].address)).to.equal(1000);
      }

    });

    it("if user doesn't have enough qui => can't deposit", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);

      // 먼저, qui가 있어야 함
      await quinoaTest.connect(addr1).mint(addr1.address, 1000);
      await quinoaTest.connect(addr1).approve(treasury.address, 100);
      
      // 그 다음 deposit
      expect(treasury.connect(addr1).deposit(1000)).to.be.reverted;
      
    });

    it ("if user doesn't approve enough qui => can't deposit", async () => {
      const [owner, addr1] = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);

      // 먼저, qui가 있어야 함
      await quinoaTest.connect(addr1).mint(addr1.address, 1000);
      
      // 그 다음 deposit
      expect(treasury.connect(addr1).deposit(1000)).to.be.reverted;
    })
  });

  describe("withdraw",async () => {

    it("burn sQui when user withdraw his qui",async () => {
      const [owner, addr1] = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);

      // 먼저 deposit
      await quinoaTest.connect(addr1).mint(addr1.address, 1000);
      await quinoaTest.connect(addr1).approve(treasury.address, 1000);
      await treasury.connect(addr1).deposit(1000);

      // 그리고 withdraw
      await treasury.connect(addr1).withdraw(1000);

      expect(await squinoa.totalSupply()).to.equal(0);
      expect(await squinoa.balanceOf(addr1.address)).to.equal(0);
      expect(await quinoaTest.balanceOf(treasury.address)).to.equal(0);
      expect(await quinoaTest.balanceOf(addr1.address)).to.equal(1000);
    });

    it("burn sQui when user withdraw his qui",async () => {
      const addrs = await ethers.getSigners();
      const {treasury, quinoaTest, squinoa} = await deployContracts();
      await treasury.setAsset(quinoaTest.address, squinoa.address);

      // 먼저 deposit
      for (let i=0; i<addrs.length; i++){
        await quinoaTest.connect(addrs[i]).mint(addrs[i].address, 1000);
        await quinoaTest.connect(addrs[i]).approve(treasury.address, 1000);
        await treasury.connect(addrs[i]).deposit(1000);

        expect(await squinoa.balanceOf(addrs[i].address)).to.equal(1000);
      }

      // 그리고 withdraw
      for (let i=0; i<addrs.length; i++){
        await treasury.connect(addrs[i]).withdraw(550);

        expect(await squinoa.totalSupply()).to.equal(1000*20 - 550*(i+1));
        expect(await squinoa.balanceOf(addrs[i].address)).to.equal(450);
        expect(await quinoaTest.balanceOf(treasury.address)).to.equal(1000*20 - 550*(i+1));
        expect(await quinoaTest.balanceOf(addrs[i].address)).to.equal(550);

      }
    });
  });
});
