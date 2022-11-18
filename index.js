const fs = require('fs')
const mongoose = require('mongoose');
const createApp = require('./app')

const conn = mongoose.createConnection(process.env.mongourl || 'mongodb://root:example@127.0.0.1/');

const app = createApp(conn)
app.listen(3000)
