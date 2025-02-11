// models/Request.js
const mongoose = require('mongoose');
// import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  phoneNo: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  area: {
    type: String,
    required: false,
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
  },
  needs: {
    type: [String],
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  numberOfPeople: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    // enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  photo : {
    type : String ,
  }
}, { timestamps: false });

module.exports = mongoose.model('Request', requestSchema);
