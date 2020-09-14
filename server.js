const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api');

const PORT = process.env.PORT || 4000;
const app = express();

app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Listening at ${PORT}...`)
})

module.exports = app;