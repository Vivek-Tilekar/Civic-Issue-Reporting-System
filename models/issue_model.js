// models/Request.js
const mongoose = require('mongoose');
// import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({


  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User collection
    required: true,
  },
  name: String,
  phoneNo: String,
  city: String,
  area: String,
  address: String,
  latitude: Number,
  longitude: Number,
  category: String,
  description: String,
  numberOfPeople: Number,
  status: {
    type: String,
    default: "pending",
  },
  photo: String,
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user who commented
      username: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
},
{ timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
