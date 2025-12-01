var express             = require('express'),
    app                 = express(),
    session             = require('express-session'),
    passport            = require('passport'),
    FacebookStrategy    = require('passport-facebook').Strategy,
    mongoose = require('mongoose'),
    multer = require('multer'),
    path = require('path'),
    Note = require('./models/Node');
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));

const upload = multer({dest: 'uploads/'});

mongoose.connect("mongodb+srv://linyimin:LYm081010.@linyimin.srwmzkx.mongodb.net/?appName=linyimin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

var user = {};  
passport.serializeUser(function (user, done) {done(null, user);});
passport.deserializeUser(function (id, done) {done(null, user);});

app.use(session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());


var facebookAuth = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL
};



passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL
}, function(accessToken, refreshToken, profile, done) {
  // ...
}));

function (token, refreshToken, profile, done) {
 console.log("Facebook Profile: " + JSON.stringify(profile));
 user = {};
 user['id'] = profile.id;
 user['name'] = profile.displayName;
 user['type'] = profile.provider;  // Facebook
 console.log('user object: ' + JSON.stringify(user));
 return done(null,user);  // put user object into session => 
req.user
 })); 

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

app.get("/", isLoggedIn, function (req, res) {
    res.send('Hello, ' + req.user.name + '!');
});

app.get("/login", function (req, res) {
 res.render("login");
});
app.get("/auth/facebook", passport.authenticate("facebook", { scope 
: "email" }));// send to facebook to do the authentication
app.get("/auth/facebook/callback",// handle the callback after facebook has authenticated the user 
passport.authenticate("facebook", {
 successRedirect : "/content",
 failureRedirect : "/"
 }));

app.get("/content", isLoggedIn, function (req, res) { 
    res.render('frontpage', {user: req.user}); });

app.get("/logout", function(req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.get("/search-page", (req, res) => {
  res.render('search'); 
});

// 获取所有文件（可选 subjectCode 过滤）
// RESTful API：返回 JSON
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

// 传统 EJS 渲染：返回 list.ejs 页面
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
      filename: req.file ? req.file.originalname : null,
      filePath: req.file ? req.file.path : null
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

