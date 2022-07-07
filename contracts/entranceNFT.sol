//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract EntranceNFT is ERC721, Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    mapping(address => bool) public WhitelistClaimed;
    bytes32 public merkleRoot;

    constructor (string memory name, string memory symbol, bytes32 _merkelRoot )
    ERC721(name, symbol){
        merkleRoot = _merkelRoot;
    }
    
    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function airdrop(bytes32[] calldata _merkleProof, address claiming) public {
        require(!WhitelistClaimed[msg.sender], "Address already claimed");
        bytes32 leaf  = keccak256(abi.encodePacked(claiming));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid Merkle Proof!");
        WhitelistClaimed[msg.sender] = true;
        safeMint(claiming);
    }
}