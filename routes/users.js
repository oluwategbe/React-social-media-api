const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { response } = require('express');

//update user
router.put("/:id", async(req, res) => {
  if(req.body.userID === req.params.id || req.body.isAdmin){
    if(req.body.password){
      try{
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      catch(err){
        return res.status(500).json(err)
      }
    }
    try{
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated")
    }
    catch(err){
      return res.status(500).json(err);
    }
  }
  else{
    return res.status(403).json("Unauthorized: You can't update this user's account");
  }
})

//delete user
router.delete("/:id", async(req, res) => {
  if(req.body.userID === req.params.id || req.body.isAdmin){
    try{
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted successfully")
    }
    catch(err){
      return res.status(500).json(err);
    }
  }
  else{
    return res.status(403).json("Unauthorized: You can't delete this user's account");
  }
})

//get a user
router.get("/", async (req, res) => {

  //if its user id that is passed, it'll call the first function, if not, it'll call the second with username
  const userId = req.query.userId;
  const username = req.query.username;
  try{
    const user = userId 
    ? await User.findById(userId)
    : await User.findOne({username: username})
    //to not send the password and updatedAt, only send the "other"
    const { password, updatedAt, ...other } = user._doc
    res.status(200).json(other);
  }
  catch(err){
    return res.status(500).json(err);
  }
})

//get friends
router.get("/friends/:userId", async (req, res) => {
  try{
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map(friendId => {
        return User.findById(friendId)
      })
    )
    let friendsList = [];
    friends.map(friend => {
      const { _id, username, profilePicture } = friend;
      friendsList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendsList);
  }
  catch(err){
    res.status(500).json(err);
  }
})

//follow a user
router.put("/:id/follow", async (req, res) => {
  if(req.body.userID !== req.params.id){
    try{
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userID);
      if(!user.followers.includes(req.body.userID)){
        await user.updateOne({
          $push: {
            followers: req.body.userID
          }
        })
        await currentUser.updateOne({
          $push: {
            followings: req.params.id
          }
        })
        res.status(200).json("User has been followed");
      }
      else{
        res.status(403).json("You already follow this user");
      }
    }
    catch(err){
      return res.status(500).json(err);
    }
  }
  else{
    res.status(403).json("You cannot follow yourself");
  }
})

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if(req.body.userID !== req.params.id){
    try{
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userID);
      if(user.followers.includes(req.body.userID)){
        await user.updateOne({
          $pull: {
            followers: req.body.userID
          }
        })
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id
          }
        })
        res.status(200).json("User has been unfollowed");
      }
      else{
        res.status(403).json("You don't follow this user");
      }
    }
    catch(err){
      return res.status(500).json(err);
    }
  }
  else{
    res.status(403).json("You cannot unfollow yourself");
  }
})

module.exports = router;