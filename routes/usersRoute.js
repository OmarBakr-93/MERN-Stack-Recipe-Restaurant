const express = require("express");
const router = express.Router();
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require('../middlewares/auth');


// Register a new user
router.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({email});
    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    const newUser = new User({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1w' });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", newUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Login a user

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1w' });
    res.status(200).json({ message: "User logged in successfully", user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get User By ID

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get User's Favorite Recipes

router.put("/favorite/:id", verifyToken, async(req,res)=>{
  try {
      const userId = req.user.id
      const recipeId= req.params.id

const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
        }

if (!user.favorites) {
user.favorites = [];
}

      if(user.favorites.includes(recipeId)){
          user.favorites.pull(recipeId)
      }
      else{
          user.favorites.push(recipeId)
      }

      await user.save()
      res.json({favorites:user.favorites})


  } catch (error) {
      res.status(500).json({error:error.message})
  }
})

module.exports = router;