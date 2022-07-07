//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IQui {
    function burn(address account, uint256 amount) external;
    function approve(address account, uint256 amount) external;

}

contract EntranceNFT is ERC721, Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    uint256 public nftPrice;
    mapping(address => bool) public WhitelistClaimed;
    bytes32 public merkleRoot;
    address public qui;

    constructor (string memory name, string memory symbol, bytes32 _merkelRoot, uint256 _nftPrice )
    ERC721(name, symbol){
        merkleRoot = _merkelRoot;
        nftPrice = _nftPrice;
    }

    function setQUiAddress(address _qui) external onlyOwner {
        require(_qui != address(0), "setQuiddress: Zero address");
        qui = _qui;
    }
    
    function safeMint(address to) internal {
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

    function buyNFT() external {
        IERC20(qui).approve(address(this), nftPrice);
        IQui(qui).burn(msg.sender, nftPrice);
        safeMint(msg.sender);
    }
}