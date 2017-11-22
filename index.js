const { spawn } = require('child_process')
const SerialPort = require('serialport')


const baudRate = 921600

/**
 * @var ports
 * @example
 * [ { comName: 'COM13',
 *   manufacturer: 'Silicon Labs',
 *   serialNumber: '00BCAC79',
 *   pnpId: 'USB\\VID_10C4&PID_EA60\\00BCAC79',
 *   locationId: 'Port_#0007.Hub_#0006',
 *   vendorId: '10C4',
 *   productId: 'EA60' },
 * { comName: 'COM15',
 *   manufacturer: 'Silicon Labs',
 *   serialNumber: '00BCB26D',
 *   pnpId: 'USB\\VID_10C4&PID_EA60\\00BCB26D',
 *   locationId: 'Port_#0004.Hub_#0006',
 *   vendorId: '10C4',
 *   productId: 'EA60' } ]
 */

const spawnPort = (port) => spawn('node serialPort.js', [ port.comName, port.serialNumber, baudRate ], { detached: true, shell: true })


SerialPort
	.list()
	.then((ports) => ports.map((port) => spawnPort(port)))
	.then((spans) => spans.forEach((span) => {
		span.stdout.on('data', (data) => process.stdout.write(`stdout: ${data}`))
		span.stderr.on('data', (data) => process.stderr.write(`\nstderr: ${data}`))
		span.on('close', (code) => process.stderr.write(`\nchild process exited with code ${code}\n`))
	}))
	.catch((reason) => process.stdout.write(reason.message))
