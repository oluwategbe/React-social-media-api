const express = require('express');
const app = express();
const mongoose = require('mongoose');;
const dotenv = require('dotenv');;
const helmet = require('helmet');
const morgan = require('morgan');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const multer = require('multer');
const path = require('path');

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  () => {
  console.log('Connected to MongoDB');
});
mongoose.set('strictQuery', true);

//this means that if you go to localhost:8800/images, go instead to public/images
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

//multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({storage: storage});

app.post("/api/upload", upload.single("file"), (req, res) => {
  try{
    return res.status(200).json("File Uploaded successfully");
  }
  catch(err){
    console.log(err);
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(8800, () => {
  console.log('Backend Server is running on port 8800');
})