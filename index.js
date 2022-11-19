const fs = require('fs')
const mongoose = require('mongoose');
const createApp = require('./app')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const conn = mongoose.createConnection(process.env.mongourl || 'mongodb://root:example@127.0.0.1/');

const app = createApp(conn)
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(3000)
