'use strict'

const Novation = require('../lib')
const controller = new Novation({
	controller : Novation.controllers.launchkey_mini_mk2
})

controller.on('connected', () => {
	console.log(`Novation ${controller.name} ${controller.version} controller ready`)

	controller.extendedMode()
	controller.reset()

	setInterval(() => {
		for (let x = 0; x < 9; x++) {
			for (let y = 0; y < 2; y++) {
				controller.ledOn(x, y, Math.random(), Math.random())
			}
		}
	}, 350)
})

controller.on('error', (err) => {
	console.error('Error occured:', err)
})

// Connect to controller
controller.connect()
