// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AcademicReviewSystem {
    
    address public owner;
    uint256 public paperCount;
    mapping(address => bool) public reviewers;
    mapping(address => string) public reviewerExpertise;
    
    event PaperSubmitted(uint256 indexed paperId, address indexed author, string title);
    event ReviewerRegistered(address indexed reviewer, string expertise);
    event ReviewSubmitted(uint256 indexed paperId, address indexed reviewer);
    
    constructor() {
        owner = msg.sender;
        paperCount = 0;
    }
    
    function submitPaper(
        string memory title,
        string memory abstractText,
        string memory ipfsHash
    ) external returns (uint256 paperId) {
        require(bytes(title).length > 0, "Title required");
        require(bytes(abstractText).length > 0, "Abstract required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        paperCount++;
        paperId = paperCount;
        
        emit PaperSubmitted(paperId, msg.sender, title);
        return paperId;
    }
    
    function registerReviewer(string memory expertise) external {
        require(bytes(expertise).length > 0, "Expertise required");
        require(!reviewers[msg.sender], "Already registered");
        
        reviewers[msg.sender] = true;
        reviewerExpertise[msg.sender] = expertise;
        
        emit ReviewerRegistered(msg.sender, expertise);
    }
    
    function submitReview(
        uint256 paperId,
        uint8 score,
        bytes32 /* inputProof */,
        string memory comments
    ) external {
        require(paperId > 0 && paperId <= paperCount, "Invalid paper ID");
        require(reviewers[msg.sender], "Not a registered reviewer");
        require(score >= 1 && score <= 10, "Invalid score");
        require(bytes(comments).length > 0, "Comments required");
        
        emit ReviewSubmitted(paperId, msg.sender);
    }
    
    function requestScoreReveal(uint256 paperId) external view {
        require(paperId > 0 && paperId <= paperCount, "Invalid paper ID");
        // Simple implementation - just emit an event
    }
    
    function getPapersByAuthor(address /* author */) external pure returns (uint256[] memory) {
        // Simplified - return empty array
        uint256[] memory empty = new uint256[](0);
        return empty;
    }
    
    function getReviewerAssignments(address /* reviewer */) external pure returns (uint256[] memory) {
        // Simplified - return empty array  
        uint256[] memory empty = new uint256[](0);
        return empty;
    }
    
    function getAllPapers(uint256 offset, uint256 limit) external view returns (uint256[] memory) {
        require(offset < paperCount, "Offset exceeds paper count");
        
        uint256 end = offset + limit;
        if (end > paperCount) {
            end = paperCount;
        }
        
        uint256 length = end - offset;
        uint256[] memory paperIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            paperIds[i] = offset + i + 1;
        }
        
        return paperIds;
    }
}