const path = require('path')
const SerialPort = require('serialport')

const { Readline, Ready } = SerialPort.parsers


SerialPort
	.list()
	.then(
		(ports) => console.log(ports)
		, (reason) => console.log(reason)
	)
	.catch((reason) => console.log(reason))
