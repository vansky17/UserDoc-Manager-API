const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const ProductsService = require('./products-service')
const { isWebUri } = require('valid-url')

const ProductRouter = express.Router()
const bodyParser = express.json()

const serializeProduct = product => ({
  id: product.id,
  name: xss(product.name)
})

ProductRouter
  .route('/')

  .get((req, res, next) => {
    ProductsService.getAllProducts(req.app.get('db'))
      .then(product => {
        res.json(product.map(serializeProduct))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { id, name } = req.body
    const newProduct = { id, name }

    for (const field of ['name']) {
      if (!newProduct[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }


    ProductsService.insertProduct(
      req.app.get('db'),
      newProduct
    )
      .then(product => {
        logger.info(`Product with id ${product.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${product.id}`))
          .json(serializeProduct(product))
      })
      .catch(next)
  })


ProductRouter
  .route('/:product_id')

  .all((req, res, next) => {
    const { product_id } = req.params
    ProductsService.getById(req.app.get('db'), product_id)
      .then(product => {
        if (!product) {
          logger.error(`Product line with id ${product} not found.`)
          return res.status(404).json({
            error: { message: `Product Line Not Found` }
          })
        }

        res.product = product
        next()
      })
      .catch(next)

  })

  .get((req, res) => {
    res.json(serializeProduct(res.product))
  })

  .delete((req, res, next) => {
    const { product_id } = req.params
    ProductsService.deleteProduct(
      req.app.get('db'),
      product_id
    )
      .then(numRowsAffected => {
        logger.info(`Product Line with id ${product_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const { name } = req.body
    const productToUpdate = { name }

    const numberOfValues = Object.values(productToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'name'.`
        }
      })
    }

    ProductsService.updateProduct(
      req.app.get('db'),
      req.params.product_id,
      productToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = ProductRouter