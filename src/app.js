require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./errorHandler');
const DocsRouter = require('./Documents/documents-router');
const ProductsRouter = require('./Products/products-router');
const db = require('./database');

const app = express();
const localUploadDirectory = process.env.LOCAL_UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const configuredOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.set('db', db);

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = !origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin);
    callback(null, allowed);
  }
}));
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/docs', DocsRouter);
app.use('/api/products', ProductsRouter);


app.get('/', (req, res) => {
  res.send('Hello, UserDoc API!');
});
app.get('/api/upload', (req, res) => {
  res.send('Hello, Upload!');
});

var sign_s3 = require('./sign_s3');

app.put(
  '/api/upload/local/:fileName',
  express.raw({ type: '*/*', limit: '25mb' }),
  sign_s3.receive_local_upload
);
app.post('/api/upload', sign_s3.sign_s3);
app.use('/uploads', express.static(localUploadDirectory));

app.use(errorHandler);

module.exports = app;
