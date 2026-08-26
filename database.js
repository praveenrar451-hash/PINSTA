// In-Memory Secure Storage
let users = [];
let posts = [];

const db = {
  findUserByUsername: (username, callback) => {
    const user = users.find(u => u.username === username);
    callback(null, user);
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
      created_at: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString() 
    };
    posts.push(newPost);
    callback(null);
  }
};

module.exports = db;
