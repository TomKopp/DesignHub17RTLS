const SerialPort = require('serialport')
const { debuglog, inspect } = require('util')


/**
 * process.argv example content
 * @type array
 * @example
 * [ 'C:\\Program Files\\nodejs\\node.exe',
 * 'D:\\Projects\\DesignHub\\DesignHub17RTLS\\DesignHub17RTLS\\serialPort.js',
 * 'COM13',
 * '00BCAC79',
 * '921600' ]
 */
const [ ,, comName, serialNumber, baudRate ] = process.argv
const serialPort = new SerialPort(comName, { baudRate: parseInt(baudRate, 10) })
const parser = serialPort.pipe(new SerialPort.parsers.Readline({ delimiter: '\r\n' }))
const debugLogger = debuglog('debug')
const tagsMatches = new Map()
let tagCount = 0


/**
 * Split readline from serial port into capture groups
 * @param	{string} 	line		readline
 * @param	{regExp} 	[regEx=(/.*\/)]	regular expression to match against the line
 * @returns	{array}					capture groups
 */
const splitLine = (line, regEx = (/.*/)) => {
	const [ , ...captureGroups ] = regEx.exec(line)

	return captureGroups
}

/**
 * Split line with special regular expression for BeSpoon tracking
 * @param	{string}	line	string that schould be split
 * @returns	{array}				array of capture groups
 */
const splitLineRegEx = (line) => splitLine(line, /SRC\s(\d*)(?:\s*LQI\s\d{1,3}%\s*)DIST\s(\d*\.\d*)/)

/**
 * http://2ality.com/2015/08/es6-map-json.html
 * @param	{map}		map		Map of tags
 * @returns	{string}			JSON.stringifyed map
 */
const mapToJson = (map) => JSON.stringify([...map])

/**
 * Capture matches into map using src id and dist value
 * @param	{array}		matches	array of capture groups
 * @returns	{boolean}			true if tagCount matches tag quantity but only if greater than 2
 */
const captureMatches = (matches) => {
	const [ src, dist ] = matches

	tagsMatches.set(parseInt(src, 10), parseFloat(dist))
	tagCount++
	tagCount %= tagsMatches.size

	// eslint-disable-next-line no-magic-numbers
	return tagCount === 0 && tagsMatches.size > 2
	// @TODO make pure and return a Maybe
}


process.stdout.write(`${serialNumber}`)
parser.on('data', (data) => {
	if (captureMatches(splitLineRegEx(data))) {
		debugLogger(inspect(tagsMatches))
		// process.send([...tagsMatches])
		process.stdout.write(mapToJson(tagsMatches))
	}
})
parser.on('error', (err) => process.stderr.write(`\nPort err: ${err.message}`))

process.on('unhandledRejection', (reason, p) => {
	// application specific logging, throwing an error, or other logic here
	process.stderr.write(`Unhandled Rejection at: Promise ${inspect(p)}\nreason: ${inspect(reason)}`)
})
