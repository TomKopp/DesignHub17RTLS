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
 * @returns	{any}	identity function
 */
const debugLoggerStderr = (data) => {
	debugLogger(inspect(data))

	return data
}

/**
 * Log messages to stderr
 * @param	{any}	data any data will be parsed with util.inspect
 * @returns	{any}	identity function
 */
const loggerStderr = (data) => {
	process.stderr.write(inspect(data))

	return data
}

/**
 * Writes JSON stringified data to stdout
 * @param	{any}	data	[description]
 * @returns	{any}			[description]
 */
const writeJsonToStdout = (data) => {
	process.stdout.write(JSON.stringify(data))

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
 * Reduce the Map to an array of its values
 * @param	{Map}	data	[description]
 * @returns	{Array}			[description]
 */
const mapToTrilatInput = (data) => [...data.values()]

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
				.then(writeJsonToStdout)
				.catch(loggerStderr)
		})
	})
	.catch(loggerStderr)
