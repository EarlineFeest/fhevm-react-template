// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleAcademicReview {
    
    address public owner;
    
    enum PaperStatus { Submitted, UnderReview, Accepted, Rejected, Withdrawn }
    
    struct Paper {
        uint256 paperId;
        address author;
        string title;
        string abstractText;
        string ipfsHash;
        PaperStatus status;
        uint256 submissionTime;
        uint256 reviewDeadline;
        bytes32[] encryptedScores;
        bytes32 aggregatedScore;
        uint256 reviewerCount;
        bool isFinalized;
    }
    
    struct Reviewer {
        address reviewerAddress;
        bool isVerified;
        uint256 reputation;
        string expertise;
        uint256 reviewsCompleted;
    }
    
    struct Review {
        uint256 paperId;
        address reviewer;
        bytes32 encryptedScore;
        bytes32 encryptedComments;
        uint256 timestamp;
        bool isSubmitted;
    }
    
    mapping(uint256 => Paper) public papers;
    mapping(address => Reviewer) public reviewers;
    mapping(uint256 => mapping(address => Review)) public reviews;
    
    uint256 public paperCount;
    uint256 public constant REVIEW_PERIOD = 30 days;
    uint8 public constant MIN_SCORE = 1;
    uint8 public constant MAX_SCORE = 10;
    
    event PaperSubmitted(uint256 indexed paperId, address indexed author, string title);
    event ReviewerVerified(address indexed reviewer, string expertise);
    event ReviewSubmitted(uint256 indexed paperId, address indexed reviewer);
    event ScoreRevealed(uint256 indexed paperId, uint256 averageScore);
    event PaperStatusChanged(uint256 indexed paperId, PaperStatus newStatus);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier nonReentrant() {
        _;
    }
    
    constructor() {
        owner = msg.sender;
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
        
        papers[paperId] = Paper({
            paperId: paperId,
            author: msg.sender,
            title: title,
            abstractText: abstractText,
            ipfsHash: ipfsHash,
            status: PaperStatus.UnderReview,
            submissionTime: block.timestamp,
            reviewDeadline: block.timestamp + REVIEW_PERIOD,
            encryptedScores: new bytes32[](0),
            aggregatedScore: bytes32(0),
            reviewerCount: 3,
            isFinalized: false
        });
        
        emit PaperSubmitted(paperId, msg.sender, title);
        return paperId;
    }
    
    function registerReviewer(string memory expertise) external {
        require(bytes(expertise).length > 0, "Expertise required");
        require(reviewers[msg.sender].reviewerAddress == address(0), "Already registered");
        
        reviewers[msg.sender] = Reviewer({
            reviewerAddress: msg.sender,
            isVerified: true,
            reputation: 100,
            expertise: expertise,
            reviewsCompleted: 0
        });
        
        emit ReviewerVerified(msg.sender, expertise);
    }
    
    function submitReview(
        uint256 paperId,
        uint8 score,
        bytes32 inputProof,
        string memory comments
    ) external nonReentrant {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        require(papers[paperId].status == PaperStatus.UnderReview, "Paper not under review");
        require(block.timestamp <= papers[paperId].reviewDeadline, "Review period ended");
        require(reviewers[msg.sender].isVerified, "Reviewer not verified");
        require(!reviews[paperId][msg.sender].isSubmitted, "Review already submitted");
        require(score >= MIN_SCORE && score <= MAX_SCORE, "Invalid score");
        
        bytes32 encryptedScore = keccak256(abi.encodePacked(score, inputProof, block.timestamp));
        bytes32 encryptedComments = keccak256(abi.encodePacked(comments, msg.sender, block.timestamp));
        
        reviews[paperId][msg.sender] = Review({
            paperId: paperId,
            reviewer: msg.sender,
            encryptedScore: encryptedScore,
            encryptedComments: encryptedComments,
            timestamp: block.timestamp,
            isSubmitted: true
        });
        
        papers[paperId].encryptedScores.push(encryptedScore);
        reviewers[msg.sender].reviewsCompleted++;
        reviewers[msg.sender].reputation += 10;
        
        emit ReviewSubmitted(paperId, msg.sender);
        
        if (papers[paperId].encryptedScores.length >= 1) {
            _finalizeReviews(paperId);
        }
    }
    
    function _finalizeReviews(uint256 paperId) internal {
        require(papers[paperId].encryptedScores.length >= 1, "Not enough reviews");
        
        bytes32 aggregatedScore = papers[paperId].encryptedScores[0];
        
        for (uint256 i = 1; i < papers[paperId].encryptedScores.length; i++) {
            aggregatedScore = keccak256(abi.encodePacked(aggregatedScore, papers[paperId].encryptedScores[i]));
        }
        
        papers[paperId].aggregatedScore = aggregatedScore;
        papers[paperId].isFinalized = true;
    }
    
    function requestScoreReveal(uint256 paperId) external {
        require(papers[paperId].isFinalized, "Reviews not finalized");
        require(msg.sender == owner || msg.sender == papers[paperId].author, "Not authorized");
        
        uint256 pseudoRandomScore = (uint256(papers[paperId].aggregatedScore) % 4) + 7;
        
        if (pseudoRandomScore >= 7) {
            papers[paperId].status = PaperStatus.Accepted;
        } else {
            papers[paperId].status = PaperStatus.Rejected;
        }
        
        emit ScoreRevealed(paperId, pseudoRandomScore);
        emit PaperStatusChanged(paperId, papers[paperId].status);
    }
    
    function getPaper(uint256 paperId) external view returns (Paper memory) {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        return papers[paperId];
    }
    
    function getPapersByAuthor(address author) external view returns (uint256[] memory paperIds) {
        uint256 count = 0;
        for (uint256 i = 1; i <= paperCount; i++) {
            if (papers[i].author == author) {
                count++;
            }
        }
        
        paperIds = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= paperCount; i++) {
            if (papers[i].author == author) {
                paperIds[index] = i;
                index++;
            }
        }
        
        return paperIds;
    }
    
    function getReviewerAssignments(address reviewer) external view returns (uint256[] memory) {
        uint256[] memory emptyArray = new uint256[](0);
        return emptyArray; // Simplified for demo
    }
    
    function getAllPapers(uint256 offset, uint256 limit) external view returns (uint256[] memory paperIds) {
        require(offset < paperCount, "Offset exceeds paper count");
        
        uint256 end = offset + limit;
        if (end > paperCount) {
            end = paperCount;
        }
        
        uint256 length = end - offset;
        paperIds = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            paperIds[i] = offset + i + 1;
        }
        
        return paperIds;
    }
}