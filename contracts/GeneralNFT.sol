//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./QuinoaNFT.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IQui {
    function burn(address account, uint256 amount) external;

}

contract GeneralNFT is QuinoaNFT, ERC2981, Ownable {

    uint256 public nftPrice;
    address public qui;
    address public treasury;
    string public contractURI;

    constructor ( uint256 _nftPrice, uint96 _royaltyFee, address _treasury)
    ERC721("Quinoa-General", "GENERAL"){
        nftPrice = _nftPrice;
        treasury = _treasury;
        setRoyaltyInfo(treasury, _royaltyFee);
        
    }


    function hasRole(address addr) public view override returns (bool){
        // 롤들이 서로 배타적이여야 하나욤..?
        return this.balanceOf(addr) > 0;
    }

    function setQUiAddress(address _qui) external {
        require(_qui != address(0), "setQuiddress: Zero address");
        qui = _qui;
    }

    function buy() external {
        IERC20(qui).approve(address(this), nftPrice);
        
        IQui(qui).burn(msg.sender, nftPrice);
        safeMint(msg.sender);
    }

    function setRoyaltyInfo(address _receiver, uint96 _royaltyFees) public onlyOwner {
        _setDefaultRoyalty(_receiver, _royaltyFees);
    }

    function setContractURI(string calldata _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}

