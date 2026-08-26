const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: 'pinsta_super_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    secure: false 
  }
}));

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// --- ROUTES ---

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/feed');
  } else {
    res.redirect('/login');
  }
});

// Signup Page
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signup', async (req, res) => {
  const { username, email_or_phone, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.insertUser({ username, email_or_phone, password: hashedPassword }, (err, result) => {
      if (err) {
        return res.render('signup', { error: 'Username already taken!' });
      }
      req.session.user = { id: result.lastID, username };
      res.redirect('/feed');
    });
  } catch (err) {
    res.render('signup', { error: 'Something went wrong. Try again!' });
  }
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.findUserByUsername(username, async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid username or password!' });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = { id: user.id, username: user.username };
      res.redirect('/feed');
    } else {
      res.render('login', { error: 'Invalid username or password!' });
    }
  });
});

// Feed / Home Page
app.get('/feed', isAuthenticated, (req, res) => {
  db.getAllPosts((err, posts) => {
    if (err) {
      posts = [];
    }
    res.render('feed', { user: req.session.user, posts });
  });
});

// Create Post Route
app.post('/post', isAuthenticated, (req, res) => {
  const { content, image_url } = req.body;
  const { id, username } = req.session.user;

  const postData = {
    user_id: id,
    username: username,
    content: content,
    image_url: image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'
  };

  db.insertPost(postData, () => {
    res.redirect('/feed');
  });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Server Listen
app.listen(PORT, () => {
  console.log(`PINSTA server is running on port ${PORT}`);
});
