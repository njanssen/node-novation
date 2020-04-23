'use strict'

const Novation = require('../lib')
const controller = new Novation({
	controller : Novation.controllers.lauchkey_mini_mk2
})

controller.on('connected', () => {
	console.log(
		`Novation ${controller.name} ${controller.version} controller ready`
	)

	controller.reset()
	controller.extendedMode()

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
