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
    address public royaltyFeeToken;
    string public contractURI;

    RoyaltyInfo private _defaultRoyaltyInfo;

    constructor ( 
        uint256 _nftPrice, 
        uint96 _royaltyFeeNumerator, 
        address _treasury,
        address _royaltyFeeToken 
    ) ERC721("Quinoa-General", "GENERAL"){
        nftPrice = _nftPrice;
        treasury = _treasury;
        setRoyaltyInfo(treasury, _royaltyFeeNumerator);
        royaltyFeeToken = _royaltyFeeToken;
    }

    function hasRole(address addr) public view override returns (bool){
        // 롤들이 서로 배타적이여야 하나욤..?
        return this.balanceOf(addr) > 0;
    }

    function setQUiAddress(address _qui) external onlyOwner {
        require(_qui != address(0), "setQuiaddress: Zero address");
        qui = _qui;
    }

    function setTreasuryAddress(address _treasury) external onlyOwner{
        require(_treasury != address(0), "setQuiaddress: Zero address");
        treasury = _treasury;
    }

    function buy() external {
        IERC20(qui).approve(address(this), nftPrice);
        
        IQui(qui).burn(msg.sender, nftPrice);
        safeMint(msg.sender);
    }

    function transferFrom(
        address from, 
        address to, 
        uint256 tokenId
        )
        public override {
            require(
                _isApprovedOrOwner(_msgSender(), tokenId),
                "transfer caller is not approved nor owner"
            );
            _payRoyaltyFee(from);
            _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId)
        public override {
            require(
                _isApprovedOrOwner(_msgSender(), tokenId), 
                "transfer caller is not approved nor owner"
            );
            _payRoyaltyFee(from);
            safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from, 
        address to, 
        uint256 tokenId,
        bytes memory _data)
        public override {
            require(
                _isApprovedOrOwner(_msgSender(), tokenId), 
                "transfer caller is not approved nor owner"
            );
            
            _safeTransfer(from, to, tokenId, _data);
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
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC2981, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _payRoyaltyFee(address from) internal {
        IERC20 token = IERC20(royaltyFeeToken);
        token.transferFrom(
            from, 
            _defaultRoyaltyInfo.receiver,
            (nftPrice * _defaultRoyaltyInfo.royaltyFraction)
            );
    }
}

