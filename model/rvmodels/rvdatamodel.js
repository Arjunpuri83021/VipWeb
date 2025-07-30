const mongoose = require('mongoose');

// Function to slugify a string
function slugify(input) {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

const mongoSchema = mongoose.Schema({
  imageUrl: String,
  altKeywords: String,
  name: { type: [String], required: true },
  titel: String,
  metatitel:String,
  videoNo: String,
  views: Number,
  link: String,
  minutes: String,
  Category: String,
  desc: String, // New field for description
}, { timestamps: true }); // This will automatically add createdAt and updatedAt fields

// Pre-save hook to handle the name field
mongoSchema.pre('save', function (next) {
  if (this.name && Array.isArray(this.name)) {
    // Slugify each element in the name array
    this.name = this.name.map((item) => slugify(item));
  }
  next();
});

module.exports = mongoose.model('rvpostData', mongoSchema);
