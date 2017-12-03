const { debuglog, inspect } = require('util')
const debugLogger = debuglog('debug')

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
 * Split readline from serial port into capture groups
 * @param	{string} 	line			readline
 * @param	{regExp} 	[regEx=(/.*\/)]	regular expression to match against the line
 * @returns	{array}						capture groups
 */
const splitLine = (line, regEx = (/.*/)) => {
	const [ , ...captureGroups ] = regEx.exec(line)

	return captureGroups
}

/**
 * Reduce the Map to an array of its values
 * @param	{Map}	data	[description]
 * @returns	{Array}			[description]
 */
const mapToValuesArray = (data) => [...data.values()]

/**
 * http://2ality.com/2015/08/es6-map-json.html
 * @param	{map}		map		Map of tags
 * @returns	{string}			JSON.stringifyed map
 */
const mapToJson = (map) => JSON.stringify([...map])

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


module.exports = {
	debugLoggerStderr
	, jsonToMap
	, loggerStderr
	, mapToJson
	, mapToValuesArray
	, splitLine
}
