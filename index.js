'use strict'

const EventEmitter = require('events')
const libmidi = require('midi')

const OPTIONS_LAUNCHKEY_MINI_MK2 = {
	name: 'Launchkey Mini',
	version: 'Mk2',
	midi: 'LK Mini MIDI',
	inControl: 'LK Mini InControl',
}

// const padsTopExtended = [96,97,98,99,100,101,102,103,104]
// const padsBottomExtended = [112,113,114,115,116,117,118,119,120]

// https://www.partsnotincluded.com/reverse-engineering/how-to-control-the-leds-on-a-novation-launchkey-mini-ii/

const LED_PAD_MATRIX = {
	pads: {
		standard: [
			[40, 41, 42, 43, 48, 49, 50, 51, 104],
			[36, 37, 38, 39, 44, 45, 46, 47, 105],
		],
		extended: [
			[96, 97, 98, 99, 100, 101, 102, 103, 104],
			[112, 113, 114, 115, 116, 117, 118, 119, 120],
		],
	},
	colors: {
		red: [0, 1, 2, 3], // +1
		green: [0, 16, 32, 48], // +16
		blue: undefined,
	},
}

class Novation extends EventEmitter {
	constructor(options = {}) {
		super()

		const OPTIONS_DEFAULTS = OPTIONS_LAUNCHKEY_MINI_MK2

		const {
			name = OPTIONS_DEFAULTS.name,
			version = OPTIONS_DEFAULTS.version,
			midi = OPTIONS_DEFAULTS.midi,
			inControl = OPTIONS_DEFAULTS.inControl,
		} = options

		this.name = name
		this.version = version
		this.midi = midi
		this.inControl = inControl

		this.midiIn = {
			midi: new libmidi.Input(),
			inControl: new libmidi.Input(),
		}

		this.midiOut = {
			midi: new libmidi.Output(),
			inControl: new libmidi.Output(),
		}

		this.midiIn.midi.on('message', (deltaTime, message) => {
			this.handleMessage(this.midi, message)
		})

		this.midiIn.inControl.on('message', (deltaTime, message) => {
			this.handleMessage(this.inControl, message)
		})
	}

	handleMessage = (portName, message) => {
		// Ignore Launchkey commands
		// * MIDI noteOn on LK Mini InControl: note 12 / velocity 127 -- set to extended mode
		// * MIDI noteOn on LK Mini InControl: note 12 / velocity 0 -- set to basic mode

		//console.log(`MIDI message arrived on port ${portName}: ${message}`)
		switch (message[0]) {
			case 176: // MIDI CC event
				this.emit('cc', portName, message[1], message[2])
				break
			case 144: // MIDI NoteOn event
				this.emit('noteOn', portName, message[1], message[2])
				break
			case 128: // MIDI NoteOff event
				this.emit('noteOff', portName, message[1], message[2])
				break
			case 153: // MIDI NoteOn event (pads in standard mode)
				this.emit('padOn', portName, message[1], message[2])
				break
			case 137: // MIDI NoteOff event (pads in standard mode)
				this.emit('padOff', portName, message[1], message[2])
				break
			default:
				console.log('Unsupported MIDI event')
				break
		}
	}

	disconnect = () => {
		this.midiIn.midi.closePort()
		this.midiIn.inControl.closePort()
		this.midiOut.midi.closePort()
		this.midiOut.inControl.closePort()
		this.emit('disconnected')
	}

	connect = () => {
		const portsIn = this._inputPorts()
		const portsOut = this._outputPorts()

		let portName = `${this.name} ${this.midi}`
		let portIn = portsIn.indexOf(portName)
		let portOut = portsOut.indexOf(portName)

		console.log(`Connecting to MIDI input port ${portIn} (${portName})`)
		this.midiIn.midi.openPort(portIn)

		console.log(`Connecting to MIDI output port ${portOut} (${portName})`)
		this.midiOut.midi.openPort(portOut)

		portName = `${this.name} ${this.inControl}`
		portIn = portsIn.indexOf(portName)
		portOut = portsOut.indexOf(portName)

		console.log(
			`Connecting to InControl input port ${portIn} (${portName})`
		)
		this.midiIn.inControl.openPort(portIn)

		console.log(
			`Connecting to InControl output port ${portOut} (${portName})`
		)
		this.midiOut.inControl.openPort(portOut)

		this.emit('ready')
	}

	_inputPorts = () => {
		const input = new libmidi.Input()

		const ports = Array.from(
			{ length: input.getPortCount() },
			(value, port) => {
				return input.getPortName(port)
			}
		)

		console.log('Detected MIDI input ports:', ports)

		return ports
	}

	_outputPorts = () => {
		const output = new libmidi.Output()

		const ports = Array.from(
			{ length: output.getPortCount() },
			(value, port) => {
				return output.getPortName(port)
			}
		)

		console.log('Detected MIDI output ports:', ports)

		return ports
	}

	noteOn = (note, velocity = 127, chan = 0) => {
		// MIDI NoteOn event (144)
		this.midiOut.inControl.sendMessage([144, note, velocity])
	}

	noteOff = (note, velocity = 127, chan = 0) => {
		// MIDI NoteOff event (128)
		this.midiOut.inControl.sendMessage([128, note, velocity])
	}

	padOn = (note, velocity = 127, chan = 0) => {
		// MIDI NoteOn event on pad while in standard mode (153)
		this.midiOut.inControl.sendMessage([153, note, velocity])
	}

	padOff = (note, velocity = 127, chan = 0) => {
		// MIDI NoteOff event on pad while in standard mode (137)
		this.midiOut.inControl.sendMessage([137, note, velocity])
	}

	cc = (control, value, chan = 0) => {
		// MIDI CC event (176)
		this.midiOut.inControl.sendMessage([176, control, value])
	}

	standardMode = () => {
		this.noteOn(12, 0)
	}

	extendedMode = () => {
		this.noteOn(12, 127)
	}

	reset = () => {
		this.cc(0,0)
	}

	color = (r, g, b) => {
		const rIdx = Math.max(0, Math.min(parseInt(r*3), 3))
		const gIdx = Math.max(0, Math.min(parseInt(g*3), 3))
		const color = LED_PAD_MATRIX.colors.red[rIdx]+LED_PAD_MATRIX.colors.green[gIdx]

		//console.log(`Color code = ${color}`)
		return color
	}

	static get OPTIONS_LAUNCHKEY_MINI_MK2() {
		return OPTIONS_LAUNCHKEY_MINI_MK2
	}
}

module.exports = Novation
