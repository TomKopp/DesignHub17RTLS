const { fork } = require('child_process')
const { resolve } = require('path')
const { inspect } = require('util')
const SerialPort = require('serialport')
const { loggerStderr } = require('./utils.js')


const baudRate = 921600

/**
 * @param {object} port desc
 * @example
 * { comName: 'COM13',
 *   manufacturer: 'Silicon Labs',
 *   serialNumber: '00BCAC79',
 *   pnpId: 'USB\\VID_10C4&PID_EA60\\00BCAC79',
 *   locationId: 'Port_#0007.Hub_#0006',
 *   vendorId: '10C4',
 *   productId: 'EA60' }
 * @returns {ChildProcess} handle
 */
const forkPortHandler = (port) => fork('./serialPort.js', [ port.comName, port.serialNumber, baudRate ], { silent: true })

/**
 * [description]
 * @param  {string} centerPointsJsonUri [description]
 * @return {ChildProcess} [description]
 */
const forkTrilatHandler = (centerPointsJsonUri) => fork('./lateration.js', [centerPointsJsonUri], { silent: true })

const trilatSolver = forkTrilatHandler(resolve(__dirname, '..', 'config', 'tagPositions.json'))

trilatSolver.stdout.pipe(process.stdout)
trilatSolver.stderr.pipe(process.stderr)
trilatSolver.on('message', (message) => process.stdout.write(`\n${inspect(message)}`))
trilatSolver.on('close', (code) => process.stderr.write(`\nchild process exited with code ${code}\n`))

SerialPort
	.list()
	.then((ports) => ports.map(forkPortHandler))
	.then((spawns) => spawns.forEach((spawn) => {
		// spawn.stdout.pipe(trilatSolver.stdin)
		// spawn.stdout.pipe(process.stdout)
		spawn.stdout.on('data', (data) => {
			trilatSolver.stdin.write(`${data}\n`)
		})
		spawn.stderr.pipe(process.stderr)
		spawn.on('message', (message) => process.stdout.write(`\n${inspect(message)}`))
		spawn.on('close', (code) => process.stderr.write(`\nchild process exited with code ${code}\n`))
	}))
	.catch(loggerStderr)
