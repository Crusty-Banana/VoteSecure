const mongoose = require("mongoose");

const votersTableSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VotingSession' },
  nationalIdentity: { type: String },
  voterId: { type: Number },
});

module.exports = mongoose.model("VotersTable", votersTableSchema);
