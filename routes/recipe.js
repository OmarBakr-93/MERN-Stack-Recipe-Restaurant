const express = require('express');
const router = express.Router();
const Recipe = require('../models/RecipeSchema');
const multer = require('multer');
const verifyToken = require('../middlewares/auth');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images') // Change this to your desired upload directory
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.fieldname
    cb(null, filename)
  }
})
const upload = multer({ storage: storage });


// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Post New Item
router.post('/', upload.single('coverImage'), verifyToken, async (req, res) => {
  const { title, ingredients, instructions } = req.body;
  if(!title || !ingredients || !instructions) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const newRecipe = await Recipe.create({
      title,
      ingredients,
      instructions,
      coverImage: req.file?.filename ,
          });
    res.status(201).json(newRecipe);
  }catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get Recipe by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const recipe = await Recipe.findById(id);
    if(!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  }catch(err) {
    console.error(err);
    if(err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update Recipe by ID
router.put('/:id', upload.single('coverImage'), async (req, res) => {
  const id = req.params.id;
  const { title, ingredients, instructions } = req.body;
  if(!title || !ingredients || !instructions) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, {
      title,
      ingredients,
      instructions,
      coverImage: req.file?.filename ,
    }, { new: true, runValidators: true });
    if(!updatedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(updatedRecipe);
  }catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Delete Recipe by ID

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if(!deletedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  }catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;