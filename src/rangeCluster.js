const { performance } = require('perf_hooks')

/**
 * [RangeCluster description]
 * @param {string|number} serialNumber [description]
 * @returns {RangeCluster} [description]
 */
const RangeCluster = function RangeCluster(serialNumber) {
	this.ranges = new Map()
	this.serialNumber = serialNumber
	this.timestamp = null
	this.count = 0

	this.ranges.toJSON = function toJSON() {
		return JSON.stringify([...this])
	}
}

RangeCluster.prototype.set = function set(key, value) {
	this.ranges.set(parseInt(key, 10), parseFloat(value))
	this.count++
	this.count %= this.ranges.size
}

RangeCluster.prototype.enough = function enough() {
	// eslint-disable-next-line no-magic-numbers
	if (this.count === 0 && this.ranges.size > 2) {
		this.timestamp = performance.now()

		return true
	}

	return false
}

RangeCluster.prototype.toString = function toString() {
	return JSON.stringify(this, [ 'ranges', 'serialNumber', 'timestamp' ])
}

RangeCluster.prototype.fromString = function fromString(str) {
	const obj = JSON.parse(str)
	const ret = new RangeCluster(obj.serialNumber)

	ret.timestamp = obj.timestamp
	ret.ranges = new Map(JSON.parse(obj.ranges))

	return ret
}


module.exports = RangeCluster
