const fs = require('fs')
const path = require('path')

const errorHandler = require('../util/error-handler')

const Product = require('../models/product')

exports.getFile = async (req, res, next) => {
	const productId = req.params.productId
	try {
		const product = await Product.findOne({ _id: productId })

		// Resource not found
		if (!product) errorHandler('Product Not Found', 404)

		const readerStream = fs.createReadStream(path.join(__dirname, '..', product.gcodeUrl))
		res.set('Content-Type', 'application/octet-stream')
		res.set('Content-Disposition', `attachment; filename="${product.title}.gcode"`)

		readerStream.pipe(res)
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
			next(err)
		}
	}
}
