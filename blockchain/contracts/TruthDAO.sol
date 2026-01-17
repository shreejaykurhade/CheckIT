// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TruthDAO is Ownable {
    IERC20 public truthToken;
    
    struct Case {
        string caseId;
        string query;
        uint256 deadline;
        uint256 trueVotes;
        uint256 falseVotes;
        bool resolved;
        bool finalVerdict; // true = TRUE, false = FALSE
        mapping(address => Vote) votes;
        address[] voters;
    }
    
    struct Vote {
        bool hasVoted;
        bool vote; // true = TRUE, false = FALSE
        uint256 stake;
    }
    
    mapping(string => Case) public cases;
    string[] public caseIds;
    
    uint256 public constant MIN_STAKE = 10 * 10**18; // 10 TRUTH tokens
    uint256 public constant REWARD_POOL = 100 * 10**18; // 100 TRUTH tokens per case
    
    event CaseCreated(string caseId, string query, uint256 deadline);
    event VoteCast(string caseId, address voter, bool vote, uint256 stake);
    event CaseResolved(string caseId, bool finalVerdict, uint256 consensusPercentage);
    event RewardDistributed(address voter, uint256 amount);
    
    constructor(address _truthToken) Ownable(msg.sender) {
        truthToken = IERC20(_truthToken);
    }
    
    function createCase(string memory _caseId, string memory _query, uint256 _durationDays) public onlyOwner {
        require(cases[_caseId].deadline == 0, "Case already exists");
        
        Case storage newCase = cases[_caseId];
        newCase.caseId = _caseId;
        newCase.query = _query;
        newCase.deadline = block.timestamp + (_durationDays * 1 days);
        newCase.resolved = false;
        
        caseIds.push(_caseId);
        
        emit CaseCreated(_caseId, _query, newCase.deadline);
    }
    
    function vote(string memory _caseId, bool _vote) public {
        Case storage case_ = cases[_caseId];
        require(case_.deadline > block.timestamp, "Voting period ended");
        require(!case_.resolved, "Case already resolved");
        require(!case_.votes[msg.sender].hasVoted, "Already voted");
        
        // Transfer stake from voter
        require(truthToken.transferFrom(msg.sender, address(this), MIN_STAKE), "Stake transfer failed");
        
        // Record vote
        case_.votes[msg.sender] = Vote({
            hasVoted: true,
            vote: _vote,
            stake: MIN_STAKE
        });
        
        case_.voters.push(msg.sender);
        
        if (_vote) {
            case_.trueVotes++;
        } else {
            case_.falseVotes++;
        }
        
        emit VoteCast(_caseId, msg.sender, _vote, MIN_STAKE);
        
        // Auto-resolve if 10 votes reached
        if (case_.trueVotes + case_.falseVotes >= 10) {
            _resolveCase(_caseId);
        }
    }
    
    function resolveCase(string memory _caseId) public {
        Case storage case_ = cases[_caseId];
        require(block.timestamp >= case_.deadline || case_.trueVotes + case_.falseVotes >= 10, "Cannot resolve yet");
        _resolveCase(_caseId);
    }
    
    function _resolveCase(string memory _caseId) internal {
        Case storage case_ = cases[_caseId];
        require(!case_.resolved, "Already resolved");
        
        case_.resolved = true;
        case_.finalVerdict = case_.trueVotes > case_.falseVotes;
        
        uint256 totalVotes = case_.trueVotes + case_.falseVotes;
        uint256 winningVotes = case_.finalVerdict ? case_.trueVotes : case_.falseVotes;
        uint256 consensusPercentage = (winningVotes * 100) / totalVotes;
        
        emit CaseResolved(_caseId, case_.finalVerdict, consensusPercentage);
        
        // Distribute rewards
        _distributeRewards(_caseId);
    }
    
    function _distributeRewards(string memory _caseId) internal {
        Case storage case_ = cases[_caseId];
        
        uint256 winningVoters = case_.finalVerdict ? case_.trueVotes : case_.falseVotes;
        uint256 rewardPerVoter = REWARD_POOL / winningVoters;
        
        for (uint i = 0; i < case_.voters.length; i++) {
            address voter = case_.voters[i];
            Vote storage voterData = case_.votes[voter];
            
            // Return stake
            truthToken.transfer(voter, voterData.stake);
            
            // Distribute reward to winners
            if (voterData.vote == case_.finalVerdict) {
                truthToken.transfer(voter, rewardPerVoter);
                emit RewardDistributed(voter, rewardPerVoter);
            }
        }
    }
    
    function getCaseDetails(string memory _caseId) public view returns (
        string memory query,
        uint256 deadline,
        uint256 trueVotes,
        uint256 falseVotes,
        bool resolved,
        bool finalVerdict
    ) {
        Case storage case_ = cases[_caseId];
        return (
            case_.query,
            case_.deadline,
            case_.trueVotes,
            case_.falseVotes,
            case_.resolved,
            case_.finalVerdict
        );
    }
    
    function hasVoted(string memory _caseId, address _voter) public view returns (bool) {
        return cases[_caseId].votes[_voter].hasVoted;
    }
}
