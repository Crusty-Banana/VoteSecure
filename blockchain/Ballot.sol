// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Ballot
 * @dev Implements voting process
 */
contract Ballot {
    struct Candidate {
        string name;
        uint voteCount;
    }

    struct CandidateSession {
        mapping(uint => Candidate) candidates;
        uint candidatesNextIndex;
    }

    struct Voter {
        bool hasVoted;
        uint voteChoice;
    }

    struct VotingSession {
        uint id;
        mapping(uint => Voter) voters;
        bool onGoing;
    }

    mapping(uint => VotingSession) public votingSessions;
    mapping(uint => CandidateSession) public candidateSessions;
    uint public votingSessionCount;
    uint public candidateSessionCount;

    constructor() {
        votingSessionCount = 0;
        candidateSessionCount = 0;
    }

    function createSession(uint numberOfVoters, string[] memory candidateNames) public {
        votingSessionCount++;
        candidateSessionCount++;
        VotingSession storage votingSession = votingSessions[votingSessionCount];
        CandidateSession storage candidateSession = candidateSessions[candidateSessionCount];
        
        for (uint i = 0; i < candidateNames.length; i++) {
            candidateSession.candidates[i] = Candidate(candidateNames[i], 0);
            candidateSession.candidatesNextIndex++;
        }

        votingSession.id = votingSessionCount;
        votingSession.onGoing = false;

        for (uint i = 0; i < numberOfVoters; i++) {
            votingSession.voters[i] = Voter(false, 0);
        }
    }

    function getSessionId() public view returns (uint256) {
        return votingSessionCount;
    }

    function startSession(uint sessionId) public {
        VotingSession storage votingSession = votingSessions[sessionId];
        require(!votingSession.onGoing, "Voting session already started.");
        votingSession.onGoing = true;
    }

    function endSession(uint sessionId) public {
        VotingSession storage votingSession = votingSessions[sessionId];
        require(votingSession.onGoing, "Voting session is not ongoing.");
        votingSession.onGoing = false;
    }

    function isSessionOngoing(uint sessionId) public view returns (bool) {
        return votingSessions[sessionId].onGoing;
    }

    function vote(uint sessionId, uint voterId, string memory candidateName) public {
        VotingSession storage votingSession = votingSessions[sessionId];
        require(votingSession.onGoing, "Voting session is not ongoing.");
        require(candidateSessions[sessionId].candidatesNextIndex > 0, "No candidates available.");
        require(!votingSession.voters[voterId].hasVoted, "You have already voted.");
        uint candidateId = getCandidateId(sessionId, candidateName);
        require(candidateId < candidateSessions[sessionId].candidatesNextIndex, "Invalid candidate name.");
        candidateSessions[sessionId].candidates[candidateId].voteCount++;
        votingSession.voters[voterId] = Voter(true, candidateId);
    }

    function getCandidateId(uint sessionId, string memory candidateName) private view returns (uint) {
        CandidateSession storage candidateSession = candidateSessions[sessionId];
        for (uint i = 0; i < candidateSession.candidatesNextIndex; i++) {
            if (keccak256(abi.encodePacked(candidateSession.candidates[i].name)) == keccak256(abi.encodePacked(candidateName))) {
                return i;
            }
        }
        return candidateSession.candidatesNextIndex;
    }

    function getVoteResults(uint sessionId) public view returns (string[] memory, uint[] memory) {
        string[] memory candidateNames = new string[](candidateSessions[sessionId].candidatesNextIndex);
        uint[] memory voteCounts = new uint[](candidateSessions[sessionId].candidatesNextIndex);

        for (uint i = 0; i < candidateSessions[sessionId].candidatesNextIndex; i++) {
            Candidate storage candidate = candidateSessions[sessionId].candidates[i];
            candidateNames[i] = candidate.name;
            voteCounts[i] = candidate.voteCount;
        }

        return (candidateNames, voteCounts);
    }
}
