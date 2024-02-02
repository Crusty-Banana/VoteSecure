const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
// const TOKEN_KEY = 'eda059d2';
require('dotenv').config();
const { TOKEN_KEY, CONTRACT_BYTECODE, SENDER_ADDRESS, BLOCKCHAIN_HOST } = process.env;


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
    res.status(400).send("Missing inputs");
  }
  await contract.methods.createSession(voters.length, candidates)
    .send({from: SENDER_ADDRESS}).then(async () => {
      await contract.methods.getSessionId().call(async (err, getIdRes) => {
        if (err) {
          console.log(err)
        } else {
          console.log(`New contract: ${getIdRes}`)
          try {
            const session = await VotingSession.create({
              description: description,
              candidates: candidates,
              sessionId: getIdRes
            })
            for (var i = 0; i< voters.length; i++) {
              const voter = new VotersTable({nationalIdentity: voters[i], voterId: i, sessionId: session})
              voter.save()
            }
            res.status(200).send(session)
          } catch (err) {
            console.log(err)
            res.status(400).send(err)
          }
        }
      })
    })
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

    const matchedVoter = await VotersTable.findOne({sessionId: session._id, nationalIdentity: voterId}).exec();

    const actualVoterId = matchedVoter.voterId;

    await contract.methods.vote(sessionId, actualVoterId, candidateName).send({from: SENDER_ADDRESS})
      .then((result, error) => {
        if (error) {
          console.log(error)
          res.status(400).send(error);
        } else {
          res.status(200).send(`Vote status - ${result}`);
        }
      });
    } catch (err) {
      res.status(400).send(err);
    }
  }
);

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
  const sessionId = parseInt(req.params.sessionId, 10)
  await contract.methods.endSession(sessionId).send({from: SENDER_ADDRESS})
    .then((result, error) => {
        if (error) {
            res.status(400).send(error)
        } else {
            res.status(200).send(result)
        }
    })
  }
)

app.post('/startSession/:sessionId', auth, async (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10)
  await contract.methods.startSession(sessionId).send({from: SENDER_ADDRESS})
    .then((result, error) => {
        if (error) {
            res.status(400).send(error)
        } else {
            res.status(200).send(result)
        }
    })
  }
); 

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
