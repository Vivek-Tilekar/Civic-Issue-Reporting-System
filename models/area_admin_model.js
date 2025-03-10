const mongoose = require("mongoose");

const AreaAdminSchema = mongoose.Schema({
    user: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    area: { type: String, required: true } // Assuming 'area' field is needed
  });
  
  // Bind this schema to the "Areaadmin" collection
  module.exports = mongoose.model("AreaAdmin", AreaAdminSchema, "Areaadmin");