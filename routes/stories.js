const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Story = require('../models/Story');

//@desc Show Add Page
//@route GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add');
});

//@desc Process Add Form
//@route POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    console.log(err);
    res.render('errors/500');
  }
});

//@desc Show All Stories
//@route GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();

    res.render('stories/index', { stories });
  } catch (err) {
    console.log(err);
    res.render('errors/500');
  }
});

//@desc Show Edit Page
//@route GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean();
  if (!story) {
    return res.render('errors/404');
  }
  if (story.user != req.user.id) {
    res.redirect('/stories');
  } else {
    res.render('stories/edit', {
      story,
    });
  }
});

//@desc Update Story
//@route PUT /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id);
  if (!story) {
    res.render('errors/404');
  }
  if (story.user != req.user.id) {
    res.redirect('/stories');
  } else {
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidator: true,
    });
    res.redirect('/dashboard');
  }
});

module.exports = router;
