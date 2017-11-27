const { readFile } = require('fs')
const { promisify, debuglog, inspect } = require('util')
const readline = require('readline')
const trilat = require('trilat')


const [ ,, positionsConfigURI ] = process.argv
const readFileAsync = promisify(readFile)
const debugLogger = debuglog('debug')
const rl = readline.createInterface({ input: process.stdin })


/**
 * Log messages to stderr, if NODE_DEBUG=debug
 * @param	{any}	data any data will be parsed with util.inspect
 * @returns	{void}
 */
const debugLoggerStderr = (data) => {
	debugLogger(inspect(data))

	return data
}

/**
 * Log messages to stderr
 * @param	{any}	data any data will be parsed with util.inspect
 * @returns	{void}
 */
const loggerStderr = (data) => {
	process.stderr.write(inspect(data))

	return data
}

/**
 * http://2ality.com/2015/08/es6-map-json.html
 * @param	{string}	jsonStr		string representation of multidimensional array
 * @returns	{Promise}				resolves with Map containing ranges
 */
const jsonToMap = (jsonStr) => new Promise((resolve, reject) => {
	try {
		resolve(new Map(JSON.parse(jsonStr)))
	} catch (err) {
		reject(err)
	}
})

/**
 * [description]
 * @param	{Map}	positions	[description]
 * @param	{Map}	ranges		[description]
 * @returns	{Map}				[description]
 */
const mergePositionsRanges = (positions, ranges) => {
	const ret = new Map()

	ranges.forEach((dist, src) => {
		if (positions.has(src)) {
			const { x, y } = positions.get(src)

			ret.set(src, [ x, y, dist ])
		}
	})

	return ret
}

/**
 * does effectively the same as a reduce
 * @param	{Map}	data	[description]
 * @returns	{Array}			[description]
 */
const mapToTrilatInput = (data) => {
	const ret = []

	data.forEach((val) => {
		ret.push(val)
	})

	return ret
}

/**
 * [description]
 * @param	{func}		mergeFn	[description]
 * @param	{string}	line	[description]
 * @returns	{Promise}			[description]
 */
const rangesPositionsToCoords = (mergeFn, line) => jsonToMap(line)
	.then(mergeFn)
	.then(debugLoggerStderr)
	.then(mapToTrilatInput)
	.then(trilat)
	.catch((err) => {
		loggerStderr(err)

		return [ null, null ]
	})


readFileAsync(positionsConfigURI, 'utf8')
	.then(jsonToMap)
	.then((positions) => (ranges) => mergePositionsRanges(positions, ranges))
	.then((fn) => (line) => rangesPositionsToCoords(fn, line))
	.then((fn) => {
		rl.on('line', (line) => {
			fn(line)
				// write to stdout
				.then(loggerStderr)
		})
	})
	.catch(loggerStderr)
