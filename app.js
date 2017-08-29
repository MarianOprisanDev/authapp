const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

// Connect to database
mongoose.connect(config.database);
// Detecting connection, and when connected, printing message
mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + config.database);
})
// Detecying Database Errors
mongoose.connection.on('error', (err) => {
    console.log('Database Error: ' + err);
})

const app = express();

const users = require('./routes/users');

// Port number
const port = 3000;

// Cors Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session())

require('./config/passport')(passport); // the function exported by config/passport is taking a parameter, so we provide one

app.use('/users', users);

// Root Route
app.get('/', (req, res) => {
    res.send('Invalid request')
});

// making sure that any other route the user follows to our website, except those defined
// will be served with the public/index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public.index.html'));
})

// Start Server
app.listen(port, () => {
    console.log('Server started on port ' + port);
});