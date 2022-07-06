//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Qui is ERC20, Ownable {

    address public treasury;
    bytes32 public merkleRoot;
    uint32 public airdropPhase;
    uint256 public tax;
    
    event TreasuryAddressUpdated(address newTreasury);
    event MerkleRootUpdated();
    event TaxUpdated(uint256 taxAmount);

    constructor(uint256 initalTax, bytes32 _merkleRoot) ERC20("Quinoa Token", "QUI") {
        tax = initalTax;
        merkleRoot = _merkleRoot;
        airdropPhase = 0;
    }

     /**
    merkle leaf consists :
    address, airdrop phase(int), token amount, isClaimed(0 or 1)

    when client claims, make new leaf with isClaimed value = 1, 
    then calculate new merkleRoot and send it as airdrop function arguments
    **/
    function airDrop(
        bytes32 _newMerkleRoot,
        bytes32[] calldata _merkleProof, 
        address claiming, 
        uint256 amount)public {

        uint8 isClaimed = 0;
        bytes32 leaf = keccak256(abi.encodePacked(claiming, airdropPhase, amount, isClaimed ));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid Merkle Proof!");
        
        updateMerkleRoot(_newMerkleRoot);
        _mint(claiming, amount);
    }

    function updateAirdropPhase(bytes32 newRoot, uint32 newAirdropPhase) public onlyOwner {
        airdropPhase = newAirdropPhase;
        merkleRoot = newRoot;
    }

    function updateMerkleRoot(bytes32 newRoot) internal {
        merkleRoot = newRoot;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function changeOwner(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    function setTreasuryAddress(address _treasury) external onlyOwner{
        require(_treasury != address(0), "setTreasuryAddress: Zero address");
        treasury = _treasury;
        emit TreasuryAddressUpdated(_treasury);
    }

    function setTax(uint256 _tax) external onlyOwner{
        tax = _tax;
        emit TaxUpdated(tax);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override{      
        uint256 taxAmount= (amount*tax)/1000;
        super._transfer(sender,treasury,taxAmount);
        super._transfer(sender,recipient,(amount - taxAmount));
        }
    }
