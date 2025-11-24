require('dotenv').config(); // 加载环境变量

var express = require('express'),
    app = express(),
    session = require('express-session'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    mongoose = require('mongoose'),
    multer = require('multer'),
    path = require('path'),
    Note = require('./models/Node');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

mongoose.connect("mongodb+srv://linyimin:LYm081010.@linyimin.srwmzkx.mongodb.net/?appName=linyimin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

var user
