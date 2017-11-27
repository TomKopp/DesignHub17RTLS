const { readFile } = require('fs')
const { promisify, debuglog, inspect } = require('util')
const trilat = require('trilat')

/*
[
//      X     Y     R
    [ 0.0,  0.0, 10.0],
    [10.0, 10.0, 10.0],
    [10.0,  0.0, 14.142135]
]
 */
const [ ,, positions ] = process.argv
const readFileAsync = promisify(readFile)
const debugLogger = debuglog('debug')


/**
 * Log messages to stderr, if NODE_DEBUG=debug
 * @param	{any}	data any data will be parsed with util.inspect
 * @returns	{void}
 */
const debugLoggerStderr = (data) => {
	debugLogger(inspect(data))

	return data
}

const loggerStderr = (data) => {
	process.stderr.write(inspect(data))

	return data
}

/**
 * http://2ality.com/2015/08/es6-map-json.html
 * @param	{string}	jsonStr		string representation of multidimensional array
 * @returns	{Map}					Map with ranges
 */
const jsonToMap = (jsonStr) => new Map(JSON.parse(jsonStr))

const mergePositionsRanges = (positions, ranges) => {

}


readFileAsync(positions, 'utf8')
	.then(debugLoggerStderr)
	.then(jsonToMap)
	.then(debugLoggerStderr)
	// .then(/*attach stdin listener*/)
	.catch(loggerStderr)
