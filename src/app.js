require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const errorHandler = require('./errorHandler')
const DocsRouter = require('./Documents/documents-router')
const ProductsRouter = require('./Products/products-router')
const multer = require('multer')
const bodyParser = require('body-parser');
const path = require('path')

const fs = require('fs');
const AWS = require('aws-sdk');

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))

app.use(cors());
app.use(helmet())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/docs', DocsRouter)
app.use('/api/products', ProductsRouter)


app.get('/', (req, res) => {
  res.send('Hello, UserDoc API!')
})
app.get('/api/upload', (req, res) => {
  res.send('Hello, Upload!')
})

var sign_s3 = require('./sign_s3');

app.use('/api/upload', sign_s3.sign_s3);

app.use(errorHandler)

module.exports = app