const mongoose = require('mongoose');

const mongoSchema = mongoose.Schema({
  webName: String,
  webLink: String,
  webDesc: String,
  email:String,
  webLogo: String, // if you're handling logos
  active: { type: Boolean, default: false } // <-- new field
});


module.exports = mongoose.model('Website', mongoSchema);
