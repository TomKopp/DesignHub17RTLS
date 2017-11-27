const { readFile } = require('fs')
const { promisify, debuglog, inspect } = require('util')
const trilat = require('trilat')


const [ ,, positions ] = process.argv
const readFileAsync = promisify(readFile)
const debugLogger = debuglog('debug')


/**
 * Log messages to stderr, if NODE_DEBUG=debug
 * @param	{any}	data any data will be parsed with util.inspect
 * @returns	{void}
 */
const debugLoggerStderr = (data) => debugLogger(inspect(data))

const loggerStderr = (data) => process.stderr.write(inspect(data))

/**
 * http://2ality.com/2015/08/es6-map-json.html
 * @param	{string}	jsonStr		string representation of multidimensional array
 * @returns	{Map}					Map with ranges
 */
const jsonToStrMap = (jsonStr) => new Map(JSON.parse(jsonStr))


readFileAsync(positions, 'utf8')
	.then(JSON.parse)
	.then(loggerStderr)
	.catch(loggerStderr)
