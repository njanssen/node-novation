'use strict'

const { Launchkey } = require('../lib')
const controller = new Launchkey()

controller.on('connected', () => {
	console.log(
		`Novation ${controller.name} ${controller.version} controller ready`
	)

	controller.reset()
	controller.extendedMode()

	controller.on('NoteOn', (message) => {
		console.log(message)
	})

	controller.on('NoteOff', (message) => {
		console.log(message)
	})

	controller.on('ControlChange', (message) => {
		console.log(message)
	})
})

controller.on('error', (err) => {
	console.error('Error occured:', err)
})

controller.connect()
