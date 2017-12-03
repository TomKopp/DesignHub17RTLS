const { readFile } = require('fs')
const { promisify } = require('util')
const readline = require('readline')
const trilat = require('trilat')
const { debugLoggerStderr, loggerStderr, jsonToMap, mapToValuesArray } = require('./utils.js')
const RangeCluster = require('./rangeCluster.js')


const [ ,, positionsConfigURI ] = process.argv
const readFileAsync = promisify(readFile)
const rl = readline.createInterface({ input: process.stdin })


/**
 * Writes JSON stringified data to stdout
 * @param	{any}	data	[description]
 * @returns	{any}			[description]
 */
const jsonStringifyToStdout = (data) => {
	process.stdout.write(JSON.stringify(data))

	return data
}

/**
 * Takes string and converts it to a RangeCluster object
 * @param	{string}	line	[description]
 * @returns	{Promis}			[description]
 */
const stringToRangeCluster = (line) => new Promise((resolve, reject) => {
	try {
		resolve(RangeCluster.prototype.fromString(line))
	} catch (err) {
		reject(err)
	}
})

/**
 * [description]
 * @param	{Map}			positions		[description]
 * @param	{rangeCluster}	rangeCluster	[description]
 * @returns	{Map}							[description]
 */
const mergePositionsRanges = (positions, rangeCluster) => {
	const ret = new Map()

	rangeCluster.ranges.forEach((dist, src) => {
		if (positions.has(src)) {
			const { x, y } = positions.get(src)

			ret.set(src, [ x, y, dist ])
		}
	})
	rangeCluster.ranges = ret

	return rangeCluster
}

/**
 * Calculate coordinations from RangeCluster
 * @param	{RangeCluster}	rangeCluster	[description]
 * @returns	{object}						[description]
 */
const calculateCoordsFromRangeCluster = (rangeCluster) => {
	const [ x, y ] = trilat(mapToValuesArray(rangeCluster.ranges))

	return {
		serialNumber: rangeCluster.serialNumber
		, timestamp: rangeCluster.timestamp
		, x
		, y
	}
}

/**
 * [description]
 * @param	{func}		mergeFn	[description]
 * @param	{string}	line	[description]
 * @returns	{Promise}			[description]
 */
const positionsRangesToCoords = (mergeFn, line) => stringToRangeCluster(line)
	.then(mergeFn)
	.then(debugLoggerStderr)
	.then(calculateCoordsFromRangeCluster)
	.catch((err) => {
		loggerStderr(err)

		return {
			serialNumber: null
			, timestamp: null
			, x: null
			, y: null
		}
	})


readFileAsync(positionsConfigURI, 'utf8')
	.then(jsonToMap)
	.then((positions) => (ranges) => mergePositionsRanges(positions, ranges))
	.then((fn) => (line) => positionsRangesToCoords(fn, line))
	.then((fn) => {
		rl.on('line', (line) => {
			fn(line)
				.then(jsonStringifyToStdout)
				.catch(loggerStderr)
		})
	})
	.catch(loggerStderr)
