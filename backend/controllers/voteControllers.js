const { CONTRACT_BYTECODE, SENDER_ADDRESS, BLOCKCHAIN_HOST } = process.env;

const VotingSession = require("../models/votingSession");
const VotersTable = require("../models/votersTable");
const contractAbi = require("../smart_contract/contractAbi.json");

const { Web3 } = require("web3");
const providerUrl = BLOCKCHAIN_HOST;
const web3 = new Web3(providerUrl);
const contractBytecode = CONTRACT_BYTECODE;
const contract = new web3.eth.Contract(contractAbi, contractBytecode);

exports.createVotingSession = async (req, res) => {
  const { description, candidates, voters } = req.body;

  if (!description || !candidates || !voters) {
    res.status(400).send("Missing inputs");
  }

  console.log(voters.length, candidates);
  await contract.methods
    .createSession(voters.length, candidates)
    .send({ from: SENDER_ADDRESS })
    .then(async () => {
      await contract.methods.getSessionId().call(async (err, getIdRes) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`New contract: ${getIdRes}`);
          try {
            const session = await VotingSession.create({
              description: description,
              candidates: candidates,
              sessionId: getIdRes,
            });
            for (var i = 0; i < voters.length; i++) {
              const voter = new VotersTable({
                nationalIdentity: voters[i],
                voterId: i,
                sessionId: session,
              });
              voter.save();
            }
            res.status(200).send(session);
          } catch (err) {
            console.log(err);
            res.status(400).send(err);
          }
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
};

exports.getVotingSessions = async (req, res) => {
  try {
    const votingSessions = await VotingSession.find({}).exec();
    res.status(200).json(votingSessions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createVote = async (req, res) => {
  const { voterId, sessionId, candidateName } = req.body;

  try {
    const session = await VotingSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const matchedVoter = await VotersTable.findOne({
      sessionId: session._id,
      nationalIdentity: voterId,
    }).exec();

    const actualVoterId = matchedVoter.voterId;

    await contract.methods
      .vote(sessionId, actualVoterId, candidateName)
      .send({ from: SENDER_ADDRESS })
      .then((result, error) => {
        if (error) {
          console.log(error);
          res.status(400).send(error);
        } else {
          res.status(200).send(`Vote status - ${result}`);
        }
      });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getOngoingSession = async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  await contract.methods.isSessionOngoing(sessionId).call((error, result) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(result);
    }
  });
};

exports.getResult = async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  await contract.methods.isSessionOngoing(sessionId).call((error, result) => {
    if (error) {
      res.status(400).send(error);
    } else {
      if (result === true) {
        res.status(500).send("The session has not finished");
      }
    }
  });
  await contract.methods.getVoteResults(sessionId).call((error, result) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).send(result);
    }
  });
};

exports.endSession = async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  await contract.methods
    .endSession(sessionId)
    .send({ from: SENDER_ADDRESS })
    .then((result, error) => {
      if (error) {
        res.status(400).send(error);
      } else {
        res.status(200).send(result);
      }
    });
};

exports.startSession = async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  await contract.methods
    .startSession(sessionId)
    .send({ from: SENDER_ADDRESS })
    .then((result, error) => {
      if (error) {
        res.status(400).send(error);
      } else {
        res.status(200).send(result);
      }
    });
};
