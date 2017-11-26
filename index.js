const { fork } = require('child_process')
const { inspect } = require('util')
const SerialPort = require('serialport')


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


SerialPort
	.list()
	.then((ports) => ports.map((port) => forkPortHandler(port)))
	.then((spawns) => spawns.forEach((spawn) => {
		spawn.stdout.on('data', (data) => process.stdout.write(`\nstdout: ${data}`))
		spawn.stderr.on('data', (data) => process.stderr.write(`\nstderr: ${data}`))
		spawn.on('message', (message) => process.stdout.write(`\n${inspect(message)}`))
		spawn.on('close', (code) => process.stderr.write(`\nchild process exited with code ${code}\n`))
	}))
	.catch((err) => process.stderr.write(err.message))
