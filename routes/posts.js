const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require('mongoose');

//create a post
router.post("/", async (req, res) => {
  const newPost = await Post(req.body);
  try{
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  }
  catch(err){
    res.status(500).json(err)
  }
})

//update a post

// router.put('/:id', (req, res) => {
//   // const { title, content } = req.body;
//   const options = { new: true }; // return the updated document
//   const id = mongoose.Types.ObjectId(req.params.id);
//   Post.findByIdAndUpdate(id, req.body, options)
//       .then(post => {
//           if (!post) {
//               res.status(404).json({ message: 'Post not found' });
//           } else {
//               res.status(200).json(post);
//           }
//       })
//       .catch(err => {
//           res.status(500).json(err);
//           res.status(500).json(req.params.id);
//       });
// });

router.put("/:id", async (req, res) => {
  try{
    if(mongoose.isValidObjectId(req.params.id)){
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.updateOne({
          $set: req.body
        });
        res.status(200).json("The post was updated successfully");
      } 
      else {
        res.status(403).json("You cannot update another person's post");
      }
    }
    else{
      res.status(500).json("Pass in a valid id: " + req.params.id);
    }
  }
  catch(err){
    res.status(500).json(err)    
  }
})

//delete a post
router.delete("/:id", async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post was deleted successfully");
    } 
    else {
      res.status(403).json("You cannot delete another person's post");
    }
  }
  catch(err){
    res.status(500).json(err)    
  }
})

//like a post
router.put("/:id/like", async(req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    if(!post.likes.includes(req.body.userId)){
      await Post.updateOne({
        $push: {
          likes: req.body.userId
        }
      });
      res.status(200).json("Post has been liked");
    }
    else{
      await Post.updateOne({
        $pull: {
          likes: req.body.userId
        }
      });
      res.status(200).json("Post has been unliked");
    }
  }
  catch(err){
    res.status(500).json(err)    
  }
})
//get a post
router.get("/:id", async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  }
  catch(err){
    return res.status(500).json(err);
  }
})

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try{
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({
      userId: currentUser._id
    });
    const friendPosts = await Promise.all(
      currentUser.followings.map(friendId => {
        return Post.find({
          userId: friendId
        });
      })
    )
    res.status(200).json(userPosts.concat(...friendPosts));
  }
  catch(err){
    res.status(500).json(err);
  }
})

//get all user's posts
router.get("/profile/:username", async (req, res) => {
  try{
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ 
      userId: user._id 
    })
    res.status(200).json(posts);
  }
  catch(err){
    res.status(500).json(err);
  }
})


module.exports = router;