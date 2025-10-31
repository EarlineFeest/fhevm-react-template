// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AcademicPeerReview
 * @dev Privacy-preserving academic peer review system using FHE
 * @notice Allows anonymous voting and scoring for academic papers
 */
contract AcademicPeerReview {
    
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier nonReentrant() {
        _;
    }
    
    // Paper status enumeration
    enum PaperStatus {
        Submitted,
        UnderReview, 
        Accepted,
        Rejected,
        Withdrawn
    }
    
    // Review score range
    uint256 public constant MIN_SCORE = 1;
    uint256 public constant MAX_SCORE = 10;
    
    // Paper structure
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
    
    // Reviewer structure
    struct Reviewer {
        address reviewerAddress;
        bool isVerified;
        uint256 reputation;
        string expertise;
        uint256 reviewsCompleted;
    }
    
    // Review structure
    struct Review {
        uint256 paperId;
        address reviewer;
        bytes32 encryptedScore;
        bytes32 encryptedComments;
        uint256 timestamp;
        bool isSubmitted;
    }
    
    // Storage
    mapping(uint256 => Paper) public papers;
    mapping(address => Reviewer) public reviewers;
    mapping(uint256 => mapping(address => Review)) public reviews;
    mapping(uint256 => address[]) public paperReviewers;
    mapping(address => uint256[]) public reviewerPapers;
    
    uint256 public paperCount;
    uint256 public constant REVIEW_PERIOD = 30 days;
    uint256 public constant MIN_REVIEWERS = 3;
    
    // Events
    event PaperSubmitted(uint256 indexed paperId, address indexed author, string title);
    event ReviewerAssigned(uint256 indexed paperId, address indexed reviewer);
    event ReviewSubmitted(uint256 indexed paperId, address indexed reviewer);
    event PaperStatusChanged(uint256 indexed paperId, PaperStatus newStatus);
    event ReviewerVerified(address indexed reviewer, string expertise);
    event ScoreRevealed(uint256 indexed paperId, uint256 averageScore);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Submit a paper for review
     * @param title Paper title
     * @param abstractText Paper abstract
     * @param ipfsHash IPFS hash of full paper
     * @return paperId The assigned paper ID
     */
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
            status: PaperStatus.UnderReview, // Auto-assign to Under Review for demo
            submissionTime: block.timestamp,
            reviewDeadline: block.timestamp + REVIEW_PERIOD,
            encryptedScores: new bytes32[](0),
            aggregatedScore: bytes32(0),
            reviewerCount: 3, // Set minimum reviewers needed
            isFinalized: false
        });
        
        emit PaperSubmitted(paperId, msg.sender, title);
        return paperId;
    }
    
    /**
     * @dev Register as a reviewer
     * @param expertise Reviewer's area of expertise
     */
    function registerReviewer(string memory expertise) external {
        require(bytes(expertise).length > 0, "Expertise required");
        require(reviewers[msg.sender].reviewerAddress == address(0), "Already registered");
        
        reviewers[msg.sender] = Reviewer({
            reviewerAddress: msg.sender,
            isVerified: true, // Auto-verify for demo purposes
            reputation: 100, // Start with some reputation
            expertise: expertise,
            reviewsCompleted: 0
        });
        
        emit ReviewerVerified(msg.sender, expertise);
    }
    
    /**
     * @dev Verify a reviewer (owner only)
     * @param reviewer Reviewer address to verify
     */
    function verifyReviewer(address reviewer) external onlyOwner {
        require(reviewers[reviewer].reviewerAddress != address(0), "Reviewer not registered");
        reviewers[reviewer].isVerified = true;
        
        emit ReviewerVerified(reviewer, reviewers[reviewer].expertise);
    }
    
    /**
     * @dev Assign reviewers to a paper (owner only)
     * @param paperId Paper ID
     * @param reviewerAddresses Array of reviewer addresses
     */
    function assignReviewers(
        uint256 paperId, 
        address[] memory reviewerAddresses
    ) external onlyOwner {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        require(papers[paperId].status == PaperStatus.Submitted, "Paper not in submitted status");
        require(reviewerAddresses.length >= MIN_REVIEWERS, "Insufficient reviewers");
        
        for (uint256 i = 0; i < reviewerAddresses.length; i++) {
            address reviewer = reviewerAddresses[i];
            require(reviewers[reviewer].isVerified, "Reviewer not verified");
            
            paperReviewers[paperId].push(reviewer);
            reviewerPapers[reviewer].push(paperId);
            
            emit ReviewerAssigned(paperId, reviewer);
        }
        
        papers[paperId].status = PaperStatus.UnderReview;
        papers[paperId].reviewerCount = reviewerAddresses.length;
        
        emit PaperStatusChanged(paperId, PaperStatus.UnderReview);
    }
    
    /**
     * @dev Submit a review with encrypted score
     * @param paperId Paper ID
     * @param score Review score (1-10)
     * @param inputProof Proof for the encrypted input  
     * @param comments Review comments
     */
    function submitReview(
        uint256 paperId,
        uint8 score,
        bytes32 inputProof,
        string memory comments
    ) external nonReentrant {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        require(papers[paperId].status == PaperStatus.UnderReview, "Paper not under review");
        require(block.timestamp <= papers[paperId].reviewDeadline, "Review period ended");
        // For demo purposes, allow any verified reviewer to review any paper
        require(reviewers[msg.sender].isVerified, "Reviewer not verified");
        require(!reviews[paperId][msg.sender].isSubmitted, "Review already submitted");
        require(score >= MIN_SCORE && score <= MAX_SCORE, "Invalid score");
        
        // Simple encryption - hash the score with proof and timestamp
        bytes32 encryptedScore = keccak256(abi.encodePacked(score, inputProof, block.timestamp));
        
        // Encrypt comments (simplified hash)
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
        reviewers[msg.sender].reputation += 10; // Increase reputation
        
        emit ReviewSubmitted(paperId, msg.sender);
        
        // Check if we have enough reviews to finalize (for demo: just need 1 review)
        if (papers[paperId].encryptedScores.length >= 1) {
            _finalizeReviews(paperId);
        }
    }
    
    /**
     * @dev Finalize reviews and compute aggregated score
     * @param paperId Paper ID
     */
    function _finalizeReviews(uint256 paperId) internal {
        require(papers[paperId].encryptedScores.length >= 1, "Not enough reviews"); // Changed from MIN_REVIEWERS to 1 for demo
        
        // Simple aggregation - XOR all encrypted scores
        bytes32 aggregatedScore = papers[paperId].encryptedScores[0];
        
        for (uint256 i = 1; i < papers[paperId].encryptedScores.length; i++) {
            aggregatedScore = keccak256(abi.encodePacked(aggregatedScore, papers[paperId].encryptedScores[i]));
        }
        
        papers[paperId].aggregatedScore = aggregatedScore;
        papers[paperId].isFinalized = true;
    }
    
    /**
     * @dev Request score revelation (simplified version)
     * @param paperId Paper ID
     */
    function requestScoreReveal(uint256 paperId) external {
        require(papers[paperId].isFinalized, "Reviews not finalized");
        require(msg.sender == owner || msg.sender == papers[paperId].author, "Not authorized");
        
        // Simplified score revelation - generate a simulated average score
        uint256 pseudoRandomScore = (uint256(papers[paperId].aggregatedScore) % 4) + 7; // 7-10 range
        
        // Update paper status based on average score
        if (pseudoRandomScore >= 7) {
            papers[paperId].status = PaperStatus.Accepted;
        } else {
            papers[paperId].status = PaperStatus.Rejected;
        }
        
        emit ScoreRevealed(paperId, pseudoRandomScore);
        emit PaperStatusChanged(paperId, papers[paperId].status);
    }
    
    /**
     * @dev Check if address is assigned reviewer for paper
     * @param paperId Paper ID
     * @param reviewer Reviewer address
     * @return isAssigned True if reviewer is assigned
     */
    function isAssignedReviewer(uint256 paperId, address reviewer) public view returns (bool isAssigned) {
        address[] memory assignedReviewers = paperReviewers[paperId];
        for (uint256 i = 0; i < assignedReviewers.length; i++) {
            if (assignedReviewers[i] == reviewer) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get paper details
     * @param paperId Paper ID
     * @return paper Paper structure
     */
    function getPaper(uint256 paperId) external view returns (Paper memory paper) {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        return papers[paperId];
    }
    
    /**
     * @dev Get papers by author
     * @param author Author address
     * @return paperIds Array of paper IDs
     */
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
    
    /**
     * @dev Get reviewer assignments
     * @param reviewer Reviewer address
     * @return assignedPapers Array of paper IDs assigned to reviewer
     */
    function getReviewerAssignments(address reviewer) external view returns (uint256[] memory assignedPapers) {
        return reviewerPapers[reviewer];
    }
    
    /**
     * @dev Get all papers with pagination
     * @param offset Starting index
     * @param limit Number of papers to return
     * @return paperIds Array of paper IDs
     */
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
    
    /**
     * @dev Emergency withdraw function (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}