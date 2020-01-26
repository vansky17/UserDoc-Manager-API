const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const DocsService = require('./documents-service')
const { isWebUri } = require('valid-url')

const DocsRouter = express.Router()
const bodyParser = express.json()

const serializeDoc = doc => ({
  id: doc.id,
  name: xss(doc.name),
  partnum: doc.partnum,
  vernum: doc.vernum,
  formattype: doc.formattype,
  reldate: doc.reldate,
  author: doc.author,
  productid: doc.productid,
  descr: xss(doc.descr),
  path: doc.path,
})

DocsRouter
  .route('/')

  .get((req, res, next) => {
    DocsService.getAllDocs(req.app.get('db'))
      .then(docs => {
        res.json(docs.map(serializeDoc))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { id, name, partnum,vernum, formattype, reldate, author, productid, descr, path} = req.body
    const newDoc = { id, name, partnum,vernum, formattype, reldate, author, productid, descr, path }

    for (const field of ['name']) {
      if (!newDoc[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }


    DocsService.insertDoc(
      req.app.get('db'),
      newDoc
    )
      .then(doc => {
        res
          .status(201)
          /* .location(path.posix.join(req.originalUrl, `${doc.id}`)) */
          .json(serializeDoc(doc))
      })
      .catch(next)
  })


DocsRouter
  .route('/:doc_id')

  .all((req, res, next) => {
    const { doc_id } = req.params
    DocsService.getById(req.app.get('db'), doc_id)
      .then(doc => {
        if (!doc) {
          logger.error(`Document with id ${doc} not found.`)
          return res.status(404).json({
            error: { message: `Document Not Found` }
          })
        }

        res.doc = doc
        next()
      })
      .catch(next)

  })

  .get((req, res) => {
    res.json(serializeDoc(res.doc))
  })

  .delete((req, res, next) => {
    const { doc_id } = req.params
    DocsService.deleteDoc(
      req.app.get('db'),
      doc_id
    )
      .then(numRowsAffected => {
        logger.info(`Document with id ${doc_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const { name } = req.body
    const docToUpdate = { name }

    const numberOfValues = Object.values(docToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name'.`
        }
      })
    }

    DocsService.updateDoc(
      req.app.get('db'),
      req.params.doc_id,
      docToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = DocsRouter

/* 
{
	"name": "Next test",
	"partnum": "1234.5678.01",
	"vernum": 2,
	"formattype": "pdf",
	"reldate": "2017-04-23T18:25:43.511Z",
	"author": "IS",
	"productid": 1,
	"descr": "This is a test doc.",
	"path": "https://google.com"
} 
*/