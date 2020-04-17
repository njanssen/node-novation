'use strict'

const EventEmitter = require('events')
const libmidi = require('midi')
const { EncodeStream, DecodeStream } = require('@lachenmayer/midi-messages')

const properties = require('./properties')

const LAUNCHKEY_MINI_MK2 = properties.launchkey_mini_mk2

class Launchkey extends EventEmitter {
	constructor(options = {}) {
		super()

		const { controller = LAUNCHKEY_MINI_MK2 } = options

		this.controller = controller

		this.inputs = {
			ports: {
				midi: new libmidi.Input(),
				incontrol: new libmidi.Input(),
			},
			decoders: {
				midi: new DecodeStream(),
				incontrol: new DecodeStream(),
			},
		}

		this.outputs = {
			ports: {
				midi: new libmidi.Output(),
				incontrol: new libmidi.Output(),
			},
			encoders: {
				midi: new EncodeStream({ useRunningStatus: false }),
				incontrol: new EncodeStream({ useRunningStatus: false }),
			},
		}

		libmidi
			.createReadStream(this.inputs.ports.midi)
			.pipe(this.inputs.decoders.midi)

		libmidi
			.createReadStream(this.inputs.ports.incontrol)
			.pipe(this.inputs.decoders.incontrol)

		this.outputs.encoders.midi.pipe(
			libmidi.createWriteStream(this.outputs.ports.midi)
		)

		this.outputs.encoders.incontrol.pipe(
			libmidi.createWriteStream(this.outputs.ports.incontrol)
		)

		this.inputs.decoders.midi.on('data', (message) => {
			message['port'] = this.controller.ports.midi
			this.handleMessage(message)
		})

		this.inputs.decoders.incontrol.on('data', (message) => {
			message['port'] = this.controller.ports.incontrol
			this.handleMessage(message)
		})
	}

	handleMessage = (message) => {
		this.emit(
			message.type,
			message
		)
	}

	disconnect = () => {
		this.inputs.ports.midi.closePort()
		this.inputs.ports.incontrol.closePort()
		this.outputs.ports.midi.closePort()
		this.outputs.ports.incontrol.closePort()
		this.emit('disconnected')
	}

	detectPorts = () => {
		return {
			input: Array.from(
				{ length: this.inputs.ports.midi.getPortCount() },
				(value, port) => {
					return this.inputs.ports.midi.getPortName(port)
				}
			),
			output: Array.from(
				{ length: this.outputs.ports.midi.getPortCount() },
				(value, port) => {
					return this.outputs.ports.midi.getPortName(port)
				}
			),
		}
	}

	connect = () => {
		const ports = this.detectPorts()

		console.log('Detected MIDI input ports:', ports.input)
		console.log('Detected MIDI output ports:', ports.output)

		Object.keys(this.controller.ports).map((portType, idx, arr) => {
			const portName = this.controller.ports[portType]
			const qualifiedPortName = `${this.name} ${portName}`
			const portIn = ports.input.indexOf(qualifiedPortName)
			const portOut = ports.output.indexOf(qualifiedPortName)

			if (portIn < 0 || portOut < 0) {
				console.log(`Port ${qualifiedPortName} is not available`)
				return
			}

			console.log(`Connecting input ${portIn} (${qualifiedPortName})`)
			this.inputs.ports[portType].openPort(portIn)

			console.log(`Connecting output ${portOut} (${qualifiedPortName})`)

			this.outputs.ports[portType].openPort(portOut)
		})

		if (this.connected()) {
			this.emit('connected')
			return true
		} else {
			this.emit('error', 'Unable to connect')
			return false
		}
	}

	connected = () => {
		return (
			this.inputs.ports.midi.isPortOpen() &&
			this.outputs.ports.midi.isPortOpen() &&
			this.inputs.ports.incontrol.isPortOpen() &&
			this.outputs.ports.incontrol.isPortOpen()
		)
	}

	disconnect = () => {
		this.inputs.ports.midi.closePort()
		this.outputs.ports.midi.closePort()
		this.inputs.ports.incontrol.closePort()
		this.outputs.ports.incontrol.closePort()
		if (!this.connected()) {
			this.emit('disconnected')
			return true
		} else {
			this.emit('error', 'Unable to disconnect')
			return false
		}
	}

	sendMessage = (message, port = 'incontrol') => {
		this.outputs.encoders[port].write(message)
	}

	noteOn = (channel, note, velocity, port = 'incontrol') => {
		this.outputs.encoders[port].noteOn(channel, note, velocity)
	}

	noteOff = (channel, note, velocity, port = 'incontrol') => {
		this.outputs.encoders[port].noteOff(channel, note, velocity)
	}

	controlChange = (channel, control, value, port = 'incontrol') => {
		this.outputs.encoders[port].controlChange(channel, control, value)
	}

	standardMode = () => {
		this.noteOn(1, 12, 0)
	}

	extendedMode = () => {
		this.noteOn(1, 12, 127)
	}

	reset = () => {
		this.controlChange(1, 0, 0)
	}

	ledAll = () => {
		this.controlChange(1, 0, 127)
	}

	ledOn = (x, y, r = 1, g = 1, b = 1) => {
		const buttons = this.controller.buttons
		const note = buttons[y][x]
		const velocity = this.intensityToVelocity(r, g, b)

		this.noteOn(1, note, velocity)
	}

	ledOff = (x, y) => {
		this.ledOn(x, y, 0, 0, 0)
	}

	ledFlash = (enabled = false) => {
		const value = 32 + (enabled ? 8 : 0)
		this.controlChange(1, 0, value)
	}

	intensityToVelocity = (r, g, b) => {
		const rIdx = Math.max(0, Math.min(parseInt(r * 3), 3))
		const gIdx = Math.max(0, Math.min(parseInt(g * 3), 3))
		const color =
			this.controller.colors.red[rIdx] +
			this.controller.colors.green[gIdx]
		return color
	}

	get name() {
		return this.controller.name
	}

	get version() {
		return this.controller.version
	}

}

module.exports = Launchkey
