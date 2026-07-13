const bcrypt = require('bcryptjs');

const plainPassword = 'admin123'; // change this to whatever password you want

bcrypt.hash(plainPassword, 10).then(hash => {
  console.log('Hashed password:', hash);
});