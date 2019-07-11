const mongoose = require("mongoose"),
  ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

var MovieSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  year: {
    type: Number
  },

  votes: {
    type: Number,
    default: 0
  }
}, {
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
    },
    id: false,
    toJSON: {
      getters: true,
      virtuals: true
    },
    toObject: {
      getters: true,
      virtuals: true
    }
  });
  
module.exports.Movie = mongoose.model('Movie', MovieSchema);