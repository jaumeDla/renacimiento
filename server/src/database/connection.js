const mongoose = require('mongoose');

mongoose.connect(process.env.DB)
    .then(() => console.log('Connected to database'))
    .catch((error) => console.log(error));

module.exports = mongoose;