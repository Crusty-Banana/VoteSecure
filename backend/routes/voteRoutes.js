const express = require("express");
const voteController = require("../controllers/voteControllers");

const router = express.Router();
const auth = require("../middleware/auth");

router
  .route("/createVotingSession")
  .post(auth, voteController.createVotingSession);
router.route("/votingSessions").get(voteController.getVotingSessions);
router.route("/vote").post(voteController.createVote);
router
  .route("/isSessionOngoing/:sessionId")
  .get(voteController.getOngoingSession);
router.route("/getResult/:sessionId").get(voteController.getResult);
router.route("/endSession/:sessionId").post(auth, voteController.endSession);
router
  .route("/startSession/:sessionId")
  .post(auth, voteController.startSession);

module.exports = router;
