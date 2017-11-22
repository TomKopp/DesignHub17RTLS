const SerialPort = require('serialport')


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
// process.stdout.write(`\n${process.argv}`)
const { Readline } = SerialPort.parsers
const [ ,, comName, serialNumber, baudRate ] = process.argv
const tags = new Map()
// let tagCount = 0

const serialPort = new SerialPort(comName, { baudRate: parseInt(baudRate, 10) })
const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }))

const splitLine = (line) => {
	const [ , ...captureGroups ] = (/(SRC \d*)(?: *LQI \d{1,3}% *)(DIST \d*\.\d*)/).exec(line)

	return captureGroups
}

const matchesToObj = (matches) => matches
	.map((el) => el.split(/\s/))
	.reduce((carry, [ param, val ]) => {
		carry[param.toLowerCase()] = parseFloat(val)

		return carry
	}, {})

process.stdout.write(`\n${serialNumber}\n`)
parser.on('data', (data) => {
	const obj = matchesToObj(splitLine(data))

	tags.set(obj.src, obj.dist)
	// tagCount++
	// tagCount %= tags.size
	process.stdout.write(`src: ${obj.src}; dist: ${obj.dist}m\n`)
})
parser.on('error', (err) => process.stderr.write(`\nPort err: ${err.message}`))
