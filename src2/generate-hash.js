const bcrypt = require('bcrypt');

bcrypt.hash('12345678901', 10).then(hash => {
  console.log('Use this hash:', hash);
  process.exit(0);
});

// $2b$10$dNK4CGC8jzBXyVTUGvosEuPXWtSpa9Ao4I95Pg9.KaFpVW3PYcggG