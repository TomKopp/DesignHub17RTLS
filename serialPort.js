const SerialPort = require('serialport')
const trilat = require('trilat')


/**
 * [process.argv description]
 * @type array
 * @example
 * [ 'C:\\Program Files\\nodejs\\node.exe',
 * 'D:\\Projects\\DesignHub\\DesignHub17RTLS\\DesignHub17RTLS\\serialPort.js',
 * 'COM13',
 * '00BCAC79',
 * '921600' ]
 */
process.stdout.write(`isTTY: ${process.stdout.isTTY}`)
const [ ,, comName, serialNumber, baudRate ] = process.argv
const serialPort = new SerialPort(comName, { baudRate: parseInt(baudRate, 10) })
const parser = serialPort.pipe(new SerialPort.parsers.Readline({ delimiter: '\r\n' }))
const ranges = new Map()
let tagCount = 0


/**
 * Split readline from serial port into capture groups.
 * @param  {string} line readline
 * @return {array}      capture groups
 */
const splitLine = (line) => {
	const [ , ...captureGroups ] = (/(SRC\s\d*)(?:\s*LQI\s\d{1,3}%\s*)(DIST\s\d*\.\d*)/).exec(line)

	return captureGroups
}

/**
 * Splits matches and puts them in object.
 * @param  {array} matches array of caputre groups
 * @return {object}         { src: 1234, dist: 1.23 (in m) }
 */
const matchesToObj = (matches) => matches
	.map((el) => el.split(/\s/))
	.reduce((carry, [ param, val ]) => {
		carry[param.toLowerCase()] = parseFloat(val)

		return carry
	}, {})

/**
 * Determine if enough ranges from different tags are recorded.
 * Has side effects!
 * @param  {object} range range object: { src: 1234, dist: 1.23 (in m) }
 * @return {boolean}       true if count of measurments equals count of tags, but more than two
 */
const captureRanges = (range) => {
	ranges.set(range.src, range.dist)
	tagCount++
	tagCount %= ranges.size

	// eslint-disable-next-line no-magic-numbers
	return tagCount === 0 && ranges.size > 2
}

const buildTrilat = (ranges) => {
// 	const ret = [
// //      X     Y     R
//     [ 0.0,  0.0, 10.0],
//     [10.0, 10.0, 10.0],
//     [10.0,  0.0, 14.142135]
// ]
	const ret = []


	return ret
}


process.stdout.write(`\n${serialNumber}\n`)
parser.on('data', (data) => {
	const range = matchesToObj(splitLine(data))

	process.stdout.write(`src: ${range.src}; dist: ${range.dist}m`)
	if (captureRanges(range)) {
		process.stdout.write('----capture----\n')
	} else {
		process.stdout.write('\n')
	}
})
parser.on('error', (err) => process.stderr.write(`\nPort err: ${err.message}`))
