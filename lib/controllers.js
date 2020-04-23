'use strict'

module.exports = {
	launchkey_mini_mk2: {
		name: 'Launchkey Mini',
		version: 'Mk2',
		ports: {
			midi: 'LK Mini MIDI',
			incontrol: 'LK Mini InControl',
		},
		controls: [21, 22, 23, 24, 25, 26, 27, 28],
		buttons: [
			[96, 97, 98, 99, 100, 101, 102, 103, 104],
			[112, 113, 114, 115, 116, 117, 118, 119, 120],
		],
		colors: {
			red: [0, 1, 2, 3],
			green: [0, 16, 32, 48],
			blue: [], // Launchkey Mini Mk2 does not have a blue LED
		},
	},
}
