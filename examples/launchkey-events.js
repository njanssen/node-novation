'use strict'

const { Launchkey } = require('../lib')

const controller = new Launchkey()

controller.on('connected', () => {
	console.log(
		`Novation ${controller.name} controller ready`
	)

	// Enable extended (InControl) mode
	controller.extendedMode()

	// Reset all LEDs
	controller.reset()

	// Light up all LEDs with amber
	// controller.ledOnAll(Launchkey.BRIGHTNESS.HIGH)

	controller.on('NoteOn', (message) => {
		console.log('NoteOn event:',message)
	})

	controller.on('NoteOff', (message) => {
		console.log('NoteOff event:',message)
	})

	controller.on('ControlChange', (message) => {
		console.log('CC event:',message)
	})
})

controller.on('error', (err) => {
	console.error('Error occured:', err)
})

controller.connect()
