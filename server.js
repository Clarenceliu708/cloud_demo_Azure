const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Note = require('./models/Node');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

mongoose.connect("mongodb+srv://linyimin:LYm081010.@linyimin.srwmzkx.mongodb.net/?appName=linyimin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

let user = {};
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((id, done) => done(null, user));

app.use(session({
  secret: "your-secret-key",
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
  console.log("Facebook Profile: " + JSON.stringify(profile));
  user = {
    id: profile.id,
    name: profile.displayName,
    type: profile.provider
  };
  console.log('user object: ' + JSON.stringify(user));
  return done(null, user);
}));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

app.get("/", isLoggedIn, (req, res) => {
  res.send('Hello, ' + req.user.name + '!');
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: "email" }));

app.get("/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/content",
    failureRedirect: "/"
  })
);

app.get("/content", isLoggedIn, (req, res) => {
  res.render('frontpage', { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get("/search-page", (req, res) => {
  res.render('search');
});

// RESTful API: 获取所有文件
app.get('/api/files', async (req, res) => {
  try {
    const { subjectCode } = req.query;
    const query = subjectCode ? { subjectCode } : {};
    const notes = await Note.find(query);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EJS 渲染：搜索页面
app.get('/search', async (req, res) => {
  try {
    const subjectCode = req.query.subjectCode;
    const notes = await Note.find({ subjectCode });
    res.render('list', { notes, subjectCode });
  } catch (err) {
    res.status(500).send('Error loading notes');
  }
});

// 创建文件
app.post('/api/files', upload.single('file'), async (req, res) => {
  try {
    const note = new Note({
      subjectCode: req.body.subjectCode,
      description: req.body.description,
      filename: req.file?.originalname || null,
      filePath: req.file?.path || null
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新文件
app.put('/api/files/:id', upload.single('file'), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'File not found' });

    if (req.file) {
      note.filename = req.file.originalname;
      note.filePath = req.file.path;
    }
    if (req.body.filename) note.filename = req.body.filename;
    if (req.body.description) note.description = req.body.description;

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除文件
app.delete('/api/files/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'File not found' });
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 下载文件
app.get('/api/files/:id/download', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'File not found' });
    res.download(path.resolve(note.filePath), note.filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
