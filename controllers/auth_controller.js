const User = require("../models/user_model");
const bcryptjs = require("bcryptjs");
const jwt = require('jsonwebtoken');

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
  if (!email || !password || email === "" || password === "") {
    res.send("All fields are required");
  }
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.send("Not a valid User");
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.send("Wrong password");
    }
    const token = jwt.sign({ id: validUser._id }, "Shubham");
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
};