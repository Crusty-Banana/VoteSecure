const mongoose = require("mongoose");

const votingSessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true },
  description: { type: String },
  candidates: [String],
});

module.exports = mongoose.model("VotingSession", votingSessionSchema);