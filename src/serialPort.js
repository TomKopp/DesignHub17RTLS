const SerialPort = require('serialport')
const { inspect } = require('util')
const { debugLoggerStderr, loggerStderr, splitLine } = require('./utils.js')
const RangeCluster = require('./rangeCluster.js')


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
const tagsMatches = new RangeCluster(serialNumber)


/**
 * Split line with special regular expression for BeSpoon tracking
 * @param	{string}	line	string that schould be split
 * @returns	{array}				array of capture groups
 */
const splitLineRegEx = (line) => splitLine(line, /SRC\s(\d*)(?:\s*LQI\s\d{1,3}%\s*)DIST\s(\d*\.\d*)/)

/**
 * Capture matches into map using src id and dist value
 * @param	{array}		matches	array of capture groups
 * @returns	{boolean}			true if tagCount matches tag quantity but only if greater than 2
 */
const captureMatches = (matches) => {
	const [ src, dist ] = matches

	tagsMatches.set(src, dist)

	return tagsMatches.enough()
}


process.stdout.write(`${serialNumber}`)
parser.on('data', (data) => {
	if (captureMatches(splitLineRegEx(data))) {
		debugLoggerStderr(tagsMatches)
		// process.send([...tagsMatches])
		process.stdout.write(tagsMatches.toString())
	}
})
parser.on('error', loggerStderr)

process.on('unhandledRejection', (reason, p) => {
	// application specific logging, throwing an error, or other logic here
	process.stderr.write(`Unhandled Rejection at: Promise ${inspect(p)}\nreason: ${inspect(reason)}`)
})
