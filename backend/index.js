const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
// const TOKEN_KEY = 'eda059d2';
require('dotenv').config();
const { TOKEN_KEY, CONTRACT_BYTECODE, SENDER_ADDRESS, BLOCKCHAIN_HOST } = process.env;

const privateKey = process.env.PRIVATE_KEY; 

const User = require("./model/user");
const VotingSession = require("./model/votingsession");
const VotersTable = require("./model/votersTable");

const app = express();
const port = 3000;
const Web3 = require('web3');
const providerUrl = BLOCKCHAIN_HOST;
const web3 = new Web3(providerUrl);

const contractAbi = require('./smart_contract/contractAbi.json')
const contractBytecode = CONTRACT_BYTECODE

const contract = new web3.eth.Contract(contractAbi, contractBytecode); 

const auth = require("./middleware/auth");

app.use(express.json());
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { connect } = require('./config/database');

connect();

app.post("/register", async (req, res) => {

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send("Missing inputs!");
    }
    const oldUser = await User.findOne({ username });
    
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username, 
      password: encryptedPassword,
    });

    res.status(201).send("User successfully created!")
  } catch (err) {
    console.log(err);
  }
});
  
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username && password)) {
      return res.status(400).send("All input is required");
    }

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, username },
        TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      return res.status(200).json({token});
    } else {
      return res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});
  
app.post('/createVotingSession', auth, async (req, res) => {
  const { description, candidates, voters } = req.body;

  if (!description || !candidates || !voters) {
    return res.status(400).send("Missing inputs");
  }

  try {
    const createSessionMethod = contract.methods.createSession(voters.length, candidates);
    const encodedABI = createSessionMethod.encodeABI();

    // Estimate gas for the transaction
    const gas = await createSessionMethod.estimateGas({ from: SENDER_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(SENDER_ADDRESS, 'latest');

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction({
      to: contract.options.address,
      data: encodedABI,
      gas,
      gasPrice,
      nonce,
      chainId: 421614,
    }, privateKey);

    // Send the signed transaction
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const id = await contract.methods.getSessionId().call(async (err, getIdRes) => {
      if (err) {
        console.log(err)
      } else {
        console.log(`New contract: ${getIdRes}`)}
        return getIdRes
      })

    // Create session in MongoDB
    const session = await VotingSession.create({
      description: description,
      candidates: candidates,
      sessionId: id // Use the actual session ID obtained from the event
    });

    // Save voters to MongoDB
    voters.forEach(async (voter, index) => {
      await VotersTable.create({
        nationalIdentity: voter,
        voterId: index,
        sessionId: session._id // Assuming this is the reference to the session document
      });
    });

    res.status(200).json(session);
  } catch (error) {
    console.error(error);
    res.status(400).send('Failed to create voting session');
  }
});


app.get('/votingSessions', async (req, res) => {
  try {
    const votingSessions = await VotingSession.find({}).exec();
    res.status(200).json(votingSessions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
})

app.post('/vote', async (req, res) => {
  const { voterId, sessionId, candidateName } = req.body;

  try {
    const session = await VotingSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const matchedVoter = await VotersTable.findOne({ sessionId: session._id, nationalIdentity: voterId }).exec();
    if (!matchedVoter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    const actualVoterId = matchedVoter.voterId;
    const voteMethod = contract.methods.vote(sessionId, actualVoterId, candidateName);
    const encodedABI = voteMethod.encodeABI();

    // Estimate gas for the transaction
    const gas = await voteMethod.estimateGas({ from: SENDER_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(SENDER_ADDRESS, 'latest');

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction({
      to: contract.options.address,
      data: encodedABI,
      gas,
      gasPrice,
      nonce,
      chainId: 421614,
    }, privateKey);

    // Send the signed transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.status(200).json({ message: 'Vote successfully recorded', receipt: receipt });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to record vote' });
  }
});


app.get('/isSessionOngoing/:sessionId', async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10)
  await contract.methods.isSessionOngoing(sessionId).call((error, result) => {
      if (error) {
          res.status(400).send(error)
      } else {
          res.status(200).send(result)
      }
  })
})
  
app.get('/getResult/:sessionId', async (req, res) => {
    const sessionId = parseInt(req.params.sessionId, 10)
    await contract.methods.getVoteResults(sessionId).call((error, result) => {
        if (error) {
            res.status(400).send(error)
        } else {
            res.status(200).send(result)
        }
    })
})

app.post('/endSession/:sessionId', auth, async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const endSessionMethod = contract.methods.endSession(sessionId);
  const encodedABI = endSessionMethod.encodeABI();

  try {
    const gas = await endSessionMethod.estimateGas({ from: SENDER_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(SENDER_ADDRESS, 'latest');

    const signedTx = await web3.eth.accounts.signTransaction({
      to: contract.options.address,
      data: encodedABI,
      gas,
      gasPrice,
      nonce,
      chainId: 421614,
    }, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.status(200).send(receipt);
  } catch (error) {
    console.error(error);
    res.status(400).send('Failed to end session');
  }
});

app.post('/startSession/:sessionId', auth, async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const startSessionMethod = contract.methods.startSession(sessionId);
  const encodedABI = startSessionMethod.encodeABI();

  try {
    const gas = await startSessionMethod.estimateGas({ from: SENDER_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(SENDER_ADDRESS, 'latest');

    const signedTx = await web3.eth.accounts.signTransaction({
      to: contract.options.address,
      data: encodedABI,
      gas,
      gasPrice,
      nonce,
      chainId: 421614,
    }, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.status(200).send(receipt);
  } catch (error) {
    console.error(error);
    res.status(400).send('Failed to start session');
  }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});