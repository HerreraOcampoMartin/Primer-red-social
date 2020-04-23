const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/social-net', {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connected DB'))
    .catch(err => console.log('err'));