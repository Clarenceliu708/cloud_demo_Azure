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

var user = {};
passport.serializeUser(function (user, done) { done(null, user); });
passport.deserializeUser(function (id, done) { done(null, user); });

app.use(session({
  secret: "your-secret-key",
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ 使用环境变量配置 Facebook 登录
var facebookAuth = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL
};

passport.use(new FacebookStrategy({
  clientID: facebookAuth.clientID,
  clientSecret: facebookAuth.clientSecret,
  callbackURL: facebookAuth.callbackURL
},
function (token, refreshToken, profile, done) {
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

// ✅ 首页默认跳转到功能页
app.get("/", isLoggedIn, function (req, res) {
  res.redirect("/content");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: "email" }));
app.get("/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/content",
    failureRedirect: "/"
  })
);

app.get("/content", isLoggedIn, function (req, res) {
  res.render('frontpage', { user: req.user });
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get("/search-page", (req, res) => {
  res.render('search');
});

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

app.get('/search', async (req, res) => {
  try {
    const subjectCode = req.query.subjectCode;
    const notes = await Note.find({ subjectCode });
    res.render('list', { notes, subjectCode });
  } catch (err) {
    res.status(500).send('Error loading notes');
  }
});

app.post('/api/files', upload.single('file'), async (req, res) => {
  try {
    const note = new Note({
      subjectCode: req.body.subjectCode,
      description: req.body.description,
      filename: req.file ? req.file.originalname : null,
      filePath: req.file ? req.file.path : null
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/files/:id', upload.single('file'), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'File not found' });

    if (req.file) {
      note.filename = req.file.originalname;
      note.filePath = req.file.path;
    }
    if (req.body.filename) {
      note.filename = req.body.filename;
    }
    if (req.body.description) {
      note.description = req.body.description;
    }
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'File not found' });
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/:id/download', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'File not found' });
    res.download(path.resolve(note.filePath), note.filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8099;
app.listen(port, () => {
  console.log(`App running at localhost:${port}/login`);
});
