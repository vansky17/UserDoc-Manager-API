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
const {CLIENT_ORIGIN} = require('./config');

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);
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

/* upload to server Solution1*/
/* const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + path.extname(file.originalname) )
  }
})
const upload = multer({ storage: storage }).single('file')

app.post('/api/upload',function(req, res) {  
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
    return res.status(200).send(req.file)
  })
}); */
/* upload to server end */
/* upload to S3 */
/* const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const fileName = 'public/dummy.pdf.pdf';
const stream = fs.createReadStream(fileName)
const uploadToBucket = () => {
fs.readFile(fileName, (err, data) => {
   if (err) throw err;
   const params = {
       Bucket: 'userdocsmanager', // pass the bucket name
       Key: 'page_bg.jpg', 
       Body: stream,
       ContentType: fileName.mimetype
   };
   s3.upload(params, function(s3Err, data) {
       if (s3Err) throw s3Err
       console.log(`File ${params.Key} uploaded successfully at ${data.Location}`)
   });
});
};
uploadToBucket(); */

var sign_s3 = require('./sign_s3');

app.use('/api/upload', sign_s3.sign_s3);

app.use(errorHandler)

module.exports = app