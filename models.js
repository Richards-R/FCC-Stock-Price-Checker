const mongoose = require('mongoose');
const { Schema } = mongoose;

let ipSchema = new Schema({
  ip: String,
  likedTickers: [String],
});


ipSchema.pre("create", async function(next) {
  if (!this.isModified("ip")) return next();
  try {
    const salt = await bcrypt.genSalt(2);
    this.ip = await bcrypt.hash(this.ip, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

const IP_in_db = mongoose.model('ipSchema', ipSchema);

exports.IP_in_db = IP_in_db;
