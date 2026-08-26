let users = [];
let posts = [];

const db = {
  findUserByUsername: (username, callback) => {
    const user = users.find(u => u.username === username);
    callback(null, user);
  },

  searchUsers: (query, callback) => {
    const matched = users.filter(u => u.username.toLowerCase().includes(query.toLowerCase()));
    callback(null, matched);
  },

  insertUser: (userObj, callback) => {
    const existing = users.find(u => u.username === userObj.username);
    if (existing) {
      return callback(new Error('Username already taken'));
    }
    const newUser = { id: Date.now(), ...userObj };
    users.push(newUser);
    callback(null, { lastID: newUser.id });
  },

  getAllPosts: (callback) => {
    const sortedPosts = [...posts].reverse();
    callback(null, sortedPosts);
  },

  insertPost: (postObj, callback) => {
    const newPost = { 
      id: Date.now(), 
      ...postObj, 
      likes: 0,
      comments: [],
      created_at: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() 
    };
    posts.push(newPost);
    callback(null);
  },

  likePost: (postId, callback) => {
    const post = posts.find(p => p.id == postId);
    if (post) {
      post.likes += 1;
    }
    callback(null);
  },

  addComment: (postId, username, text, callback) => {
    const post = posts.find(p => p.id == postId);
    if (post) {
      post.comments.push({ username, text });
    }
    callback(null);
  }
};

module.exports = db;
