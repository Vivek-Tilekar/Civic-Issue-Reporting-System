
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth_route');
const issueRoute = require('./routes/issue_route');
const ngrok = require("ngrok");
const path = require("path")
const app = express();
const cors = require('cors');

app.use(express.json())
app.use(cors());

const PORT = 3000;

mongoose
  .connect(
    "mongodb://localhost:27017/ResQ"
  ).then(() => {
    console.log("Database connected")
  }).catch((err) => {
    console.log(err)
  })

  // app.use('/uploads/images', express.static('uploads/images'));
  app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));

app.get("data" , (req, res) => {
    res.send("hello")
})
app.use("/api/auth" , authRoutes)
app.use("/api/issue" , issueRoute)

app.listen(PORT, () => {
    console.log("Server is running on port 3000");

    // ngrok.connect(PORT).then(ngrokUrl => {
    //   console.log(`Ngrok tunnel in: ${ngrokUrl}`);
    // }).catch(error=> {
    //   console.log(`errors: ${error.message}`)
    // })
  });