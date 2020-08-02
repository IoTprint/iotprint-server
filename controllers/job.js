const errorHandler = require('../util/error-handler')

const User = require('../models/user')
const Job = require('../models/job')

exports.getJobs = async (req, res, next) => {
	const currentPage = req.query.page || 1
	const perPage = 9
	try {
		const totalItems = await Job.find({ 'user.userId': req.userId }).countDocuments()
		const jobs = await Job.find({ 'user.userId': req.userId })
			.populate('product')
			.sort({ createdAt: -1 })
			.skip((currentPage - 1) * perPage)
			.limit(perPage)
		// Resource not found
		if (!jobs) errorHandler('No Jobs Found', 404)

		res.status(200).json({ message: 'Jobs Fetched', jobs, totalItems })
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
		}
		next(err)
	}
}

exports.getJob = async (req, res, next) => {
	const jobId = req.params.jobId
	try {
		const job = await Job.findById(jobId)
		// Resource not found
		if (!job) errorHandler('Job Not Found', 404)

		res.status(200).json({ message: 'Fetched Job', job })
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
		}
		next(err)
	}
}

exports.createJob = async (req, res, next) => {
	const productId = req.body.productId
	const userId = req.userId
	try {
		const user = await User.findById(userId)

		const job = new Job({
			product: productId,
			user: { email: user.email, userId },
		})
		await job.save()

		res.status(201).json({ message: 'Job Created Successfully', job })
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
		}
		next(err)
	}
}

exports.updateJob = async (req, res, next) => {
	const jobId = req.params.jobId
	const status = req.body.status
	try {
		const job = await Job.findById(jobId)
		// Resource not found
		if (!job) errorHandler('Job Not Found', 404)
		job.status = status
		await job.save()

		res.status(200).json({ message: 'Job Updated', job })
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
		}
		next(err)
	}
}

exports.deleteJob = async (req, res, next) => {
	const jobId = req.params.jobId
	try {
		const job = await Job.findById(jobId)
		// Resource not found
		if (!job) errorHandler('Job Not Found', 404)

		// Authorization Mechanism By User id
		if (job.user.userId.toString() !== req.userId.toString())
			errorHandler('UnAuthorized', 403)

		// Check if Status is equal to 'standby'
		if (job.status !== 'standby') errorHandler('Cant Cancel Job At this Moment', 400)

		job.status = 'canceled'
		await job.save()

		res.status(200).json({ message: 'Job Canceled' })
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500
		}
		next(err)
	}
}