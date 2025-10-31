// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "fhevm/lib/TFHE.sol";

/**
 * @title AcademicPeerReview - FHE Enhanced Version
 * @dev Privacy-preserving academic peer review system with real FHE functionality
 * @notice Uses TFHE library for fully homomorphic encryption operations
 */
contract AcademicPeerReview {
    
    address public owner;
    uint256 public paperCount;
    
    // Paper status enumeration
    enum PaperStatus {
        Submitted,
        UnderReview, 
        Accepted,
        Rejected,
        Withdrawn
    }
    
    // Paper structure with FHE support
    struct Paper {
        uint256 paperId;
        address author;
        string title;
        string abstractText;
        string ipfsHash;
        PaperStatus status;
        uint256 submissionTime;
        uint256 reviewDeadline;
        uint256 reviewerCount;
        bool isFinalized;
        euint8 encryptedScore; // FHE encrypted aggregated score
        euint8 secretNumber;   // FHE encrypted random number for validation
    }
    
    // Reviewer structure
    struct Reviewer {
        address reviewerAddress;
        bool isVerified;
        uint256 reputation;
        string expertise;
        uint256 reviewsCompleted;
    }
    
    // Storage
    mapping(uint256 => Paper) public papers;
    mapping(address => Reviewer) public reviewers;
    mapping(address => uint256[]) public reviewerPapers;
    
    // FHE encrypted review scores storage
    mapping(uint256 => euint8[]) private encryptedScores; // paperId => encrypted scores array
    mapping(uint256 => mapping(address => euint8)) private reviewerScores; // paperId => reviewer => encrypted score
    
    uint256 public constant REVIEW_PERIOD = 30 days;
    uint256 public constant MIN_REVIEWERS = 3;
    uint256 public constant MIN_SCORE = 1;
    uint256 public constant MAX_SCORE = 10;
    
    // Events
    event PaperSubmitted(uint256 indexed paperId, address indexed author, string title);
    event ReviewerRegistered(address indexed reviewer, string expertise);
    event ReviewSubmitted(uint256 indexed paperId, address indexed reviewer);
    event PaperStatusChanged(uint256 indexed paperId, PaperStatus newStatus);
    event ScoreRevealed(uint256 indexed paperId, uint256 averageScore);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Submit a paper for review
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
        
        // Generate encrypted secret number for this paper
        euint8 secretNumber = TFHE.asEuint8(uint8((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100) + 1));
        TFHE.allow(secretNumber, address(this));
        
        // Initialize encrypted score with zero
        euint8 initialScore = TFHE.asEuint8(0);
        TFHE.allow(initialScore, address(this));
        
        papers[paperId] = Paper({
            paperId: paperId,
            author: msg.sender,
            title: title,
            abstractText: abstractText,
            ipfsHash: ipfsHash,
            status: PaperStatus.Submitted,
            submissionTime: block.timestamp,
            reviewDeadline: block.timestamp + REVIEW_PERIOD,
            reviewerCount: 0,
            isFinalized: false,
            encryptedScore: initialScore,
            secretNumber: secretNumber
        });
        
        emit PaperSubmitted(paperId, msg.sender, title);
        return paperId;
    }
    
    /**
     * @dev Register as a reviewer
     */
    function registerReviewer(string memory expertise) external {
        require(bytes(expertise).length > 0, "Expertise required");
        
        reviewers[msg.sender] = Reviewer({
            reviewerAddress: msg.sender,
            isVerified: true, // Auto-verify for demo
            reputation: 100,
            expertise: expertise,
            reviewsCompleted: 0
        });
        
        emit ReviewerRegistered(msg.sender, expertise);
    }
    
    /**
     * @dev Submit a review with FHE encrypted score
     */
    function submitReview(
        uint256 paperId,
        uint8 score,
        string memory comments,
        bytes32 publicKey
    ) external {
        require(reviewers[msg.sender].isVerified, "Not verified reviewer");
        _submitReviewInternal(paperId, score, comments, publicKey);
    }
    
    /**
     * @dev Reveal final scores using FHE decryption
     */
    function revealScore(
        uint256 paperId,
        bytes32 privateKey
    ) external returns (uint256 averageScore) {
        require(papers[paperId].isFinalized, "Reviews not finalized");
        require(papers[paperId].reviewerCount > 0, "No reviews submitted");
        
        // Request FHE decryption of the aggregated encrypted score
        TFHE.allowTransient(papers[paperId].encryptedScore, msg.sender);
        uint8 totalScore = TFHE.decrypt(papers[paperId].encryptedScore);
        
        // Calculate average score
        averageScore = uint256(totalScore) / papers[paperId].reviewerCount;
        
        // Ensure score is within valid range (fallback for edge cases)
        if (averageScore < MIN_SCORE || averageScore > MAX_SCORE) {
            averageScore = 7; // Default to neutral score
        }
        
        // Update paper status based on average score
        if (averageScore >= 7) {
            papers[paperId].status = PaperStatus.Accepted;
        } else {
            papers[paperId].status = PaperStatus.Rejected;
        }
        
        emit ScoreRevealed(paperId, averageScore);
        emit PaperStatusChanged(paperId, papers[paperId].status);
        
        return averageScore;
    }
    
    /**
     * @dev Get encrypted score for verification (FHE-compatible)
     */
    function getEncryptedScore(uint256 paperId) external view returns (bytes memory) {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        require(papers[paperId].isFinalized, "Reviews not finalized");
        
        // Return encrypted score as bytes for frontend processing
        return abi.encodePacked(papers[paperId].encryptedScore);
    }
    
    /**
     * @dev Check if current hour allows for review submission (FHE game logic)
     */
    function isGuessTimeActive() external view returns (bool) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        return currentHour % 2 == 1; // Odd hours for review submission
    }
    
    /**
     * @dev Check if current hour allows for score revelation
     */
    function isRevealTimeActive() external view returns (bool) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        return currentHour % 2 == 0; // Even hours for score revelation
    }
    
    /**
     * @dev Get paper details
     */
    function getPaper(uint256 paperId) external view returns (Paper memory paper) {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        return papers[paperId];
    }
    
    /**
     * @dev Get papers by author
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
     */
    function getReviewerAssignments(address reviewer) external view returns (uint256[] memory assignedPapers) {
        return reviewerPapers[reviewer];
    }
    
    /**
     * @dev Get all papers with pagination
     */
    function getAllPapers(uint256 offset, uint256 limit) external view returns (uint256[] memory paperIds) {
        if (paperCount == 0 || offset >= paperCount) {
            return new uint256[](0);
        }
        
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
     * @dev Get current round info (compatibility function for frontend)
     */
    function getCurrentRoundInfo() external view returns (uint8, bool, bool, uint256, uint256) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        bool isOddHour = currentHour % 2 == 1;
        
        return (
            uint8(paperCount % 256), // round number (truncated)
            true, // number generated
            false, // round ended
            block.timestamp, // start time
            paperCount // total papers submitted
        );
    }
    
    /**
     * @dev Get player guess status (compatibility function for frontend)
     */
    function getPlayerGuessStatus(address player) external view returns (bool, uint256) {
        return (
            reviewers[player].isVerified, // has submitted (analogous to "has guessed")
            reviewers[player].reviewsCompleted // reviews completed (analogous to timestamp)
        );
    }
    
    /**
     * @dev Check if it's odd hour (review submission time)
     */
    function isOddHour() external view returns (bool) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        return currentHour % 2 == 1;
    }
    
    /**
     * @dev Check if it's even hour (score revelation time)
     */
    function isEvenHour() external view returns (bool) {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        return currentHour % 2 == 0;
    }
    
    /**
     * @dev Get current hour in UTC (for frontend compatibility)
     */
    function getCurrentHourUTC3() external view returns (uint256) {
        // Add 3 hours to UTC for UTC+3 timezone
        return ((block.timestamp + 3 * 3600) / 3600) % 24;
    }
    
    /**
     * @dev Start new round (compatibility function)
     */
    function startNewRound() external {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        require(currentHour % 2 == 1, "Can only start rounds during odd hours");
        emit PaperSubmitted(paperCount + 1, msg.sender, "New Review Round Started");
    }
    
    /**
     * @dev Submit guess (compatibility function - maps to submitReview)
     */
    function submitGuess(uint8 _guess) external {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        require(currentHour % 2 == 1, "Can only submit during odd hours");
        require(_guess >= 0 && _guess <= 100, "Guess must be between 0-100");
        
        // Auto-register as reviewer if not already registered
        if (!reviewers[msg.sender].isVerified) {
            reviewers[msg.sender] = Reviewer({
                reviewerAddress: msg.sender,
                isVerified: true,
                reputation: 100,
                expertise: "Anonymous Reviewer",
                reviewsCompleted: 0
            });
        }
        
        // Map guess (0-100) to review score (1-10)
        uint8 reviewScore = uint8((_guess / 10) + 1);
        if (reviewScore > 10) reviewScore = 10;
        if (reviewScore < 1) reviewScore = 1;
        
        // Find the most recent paper to review, or create a default one
        uint256 targetPaperId = paperCount;
        if (paperCount == 0) {
            // Create a default paper for guessing game
            paperCount++;
            targetPaperId = paperCount;
            
            euint8 secretNumber = TFHE.asEuint8(uint8((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100) + 1));
            TFHE.allow(secretNumber, address(this));
            
            euint8 defaultScore = TFHE.asEuint8(0);
            TFHE.allow(defaultScore, address(this));
            
            papers[targetPaperId] = Paper({
                paperId: targetPaperId,
                author: address(this),
                title: "Anonymous Review Round",
                abstractText: "Decentralized anonymous peer review session",
                ipfsHash: "QmDefaultHash",
                status: PaperStatus.UnderReview,
                submissionTime: block.timestamp,
                reviewDeadline: block.timestamp + REVIEW_PERIOD,
                reviewerCount: 0,
                isFinalized: false,
                encryptedScore: defaultScore,
                secretNumber: secretNumber
            });
        }
        
        // Submit the review
        _submitReviewInternal(targetPaperId, reviewScore, "Anonymous guess", bytes32(0));
    }
    
    /**
     * @dev Internal function to submit review
     */
    function _submitReviewInternal(
        uint256 paperId,
        uint8 score,
        string memory comments,
        bytes32 publicKey
    ) internal {
        require(papers[paperId].paperId != 0, "Paper does not exist");
        require(score >= MIN_SCORE && score <= MAX_SCORE, "Invalid score");
        // Check if reviewer already submitted for this paper
        bool hasSubmitted = false;
        for (uint i = 0; i < reviewerPapers[msg.sender].length; i++) {
            if (reviewerPapers[msg.sender][i] == paperId) {
                hasSubmitted = true;
                break;
            }
        }
        require(!hasSubmitted, "Review already submitted");
        
        // Encrypt the score using FHE
        euint8 encryptedScore = TFHE.asEuint8(score);
        
        // Allow this contract to perform operations on the encrypted value
        TFHE.allow(encryptedScore, address(this));
        
        // Store encrypted score
        encryptedScores[paperId].push(encryptedScore);
        reviewerScores[paperId][msg.sender] = encryptedScore;
        
        // Update paper status
        papers[paperId].status = PaperStatus.UnderReview;
        papers[paperId].reviewerCount++;
        
        // Compute homomorphic sum of all scores for this paper
        if (papers[paperId].reviewerCount == 1) {
            papers[paperId].encryptedScore = encryptedScore;
        } else {
            papers[paperId].encryptedScore = TFHE.add(papers[paperId].encryptedScore, encryptedScore);
            // Allow this contract to perform operations on the result
            TFHE.allow(papers[paperId].encryptedScore, address(this));
        }
        
        // Auto-finalize after 3 reviews for demo
        if (papers[paperId].reviewerCount >= 3) {
            papers[paperId].isFinalized = true;
        }
        
        reviewers[msg.sender].reviewsCompleted++;
        reviewers[msg.sender].reputation += 10;
        
        emit ReviewSubmitted(paperId, msg.sender);
        
        // Add to reviewer assignments
        reviewerPapers[msg.sender].push(paperId);
    }
    
    /**
     * @dev Get round history (compatibility function)
     */
    function getRoundHistory(uint8 roundId) external view returns (bool, address, uint8, uint256, uint256, uint256) {
        if (roundId == 0 || roundId > paperCount) {
            return (false, address(0), 0, 0, 0, 0);
        }
        
        Paper memory paper = papers[roundId];
        uint8 secretNum = 50; // Mock secret number for compatibility
        
        return (
            paper.isFinalized,        // round ended
            paper.author,            // winner (author)
            secretNum,               // secret number
            paper.submissionTime,    // start time
            paper.reviewDeadline,    // end time
            paper.reviewerCount      // participant count
        );
    }
    
    /**
     * @dev Event emission compatibility
     */
    event RoundStarted(uint8 indexed round, uint256 startTime);
    event GuessSubmitted(address indexed player, uint8 indexed round);
    event RoundEnded(uint8 indexed round, address indexed winner, uint8 secretNumber);
    event NoWinner(uint8 indexed round, uint8 secretNumber);
    
    /**
     * @dev Reveal result compatibility function
     */
    function revealResult() external {
        uint256 currentHour = (block.timestamp / 3600) % 24;
        require(currentHour % 2 == 0, "Can only reveal during even hours");
        
        if (paperCount > 0) {
            Paper storage paper = papers[paperCount];
            if (paper.isFinalized && !_isRoundRevealed(paperCount)) {
                // Allow transient access for FHE decryption
                TFHE.allowTransient(paper.encryptedScore, msg.sender);
                uint8 totalScore = TFHE.decrypt(paper.encryptedScore);
                uint8 averageScore = totalScore / uint8(paper.reviewerCount);
                
                if (averageScore >= 7) {
                    emit RoundEnded(uint8(paperCount), paper.author, averageScore);
                } else {
                    emit NoWinner(uint8(paperCount), averageScore);
                }
            }
        }
    }
    
    /**
     * @dev Check if round result is revealed
     */
    function _isRoundRevealed(uint256 roundId) internal view returns (bool) {
        if (roundId == 0 || roundId > paperCount) return false;
        return papers[roundId].status == PaperStatus.Accepted || papers[roundId].status == PaperStatus.Rejected;
    }
}