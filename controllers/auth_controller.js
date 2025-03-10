const User = require("../models/user_model");
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');
const AreaAdmin = require("../models/area_admin_model") 

const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === '' ||
    email === '' ||
    password === ''
  ) {
    res.send("Wrong data format");
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();
    res.json('Signup successful');
  } catch (error) {
    next(error);
  }
};



const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(404).json({ message: "Not a valid User" });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: validUser._id }, "Shubham");

    const { password: pass, _id: userId, username, ...rest } = validUser._doc;  // Extracting userId explicitly

    res.status(200).json({
      userId,  // Explicitly returning userId
      username, // Sending username for UI display
      token,
    });

  } catch (err) {
    next(err);
  }
};



const adminSignin = async (req, res, next) => {
  const { user, password } = req.body;

  if (!user || !password || user === "" || password === "") {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the user in Areaadmin collection
    const validUser = await AreaAdmin.findOne({ user });

    if (!validUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // Compare hashed password with the provided password
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: validUser._id }, "Shubham", { expiresIn: "1h" });

    // Exclude password from the response
    const { password: pass, ...rest } = validUser._doc;
    const response = { ...rest, token };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  signin,
  adminSignin,
};