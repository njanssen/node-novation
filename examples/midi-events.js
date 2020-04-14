'use strict'

const Novation = require('../')
const launchkey = new Novation()

launchkey.on('ready', () => {
    console.log('Novation controller ready')

    launchkey.extendedMode()

    launchkey.reset()

    launchkey.on('noteOn', (port,note,velocity) => {
        console.log(`MIDI noteOn on ${port}: note ${note} / velocity ${velocity}`)
    })

    launchkey.on('noteOff', (port,note,velocity) => {
        console.log(`MIDI noteOff on ${port}: note ${note} / velocity ${velocity}`)
    })

    launchkey.on('padOn', (port,note,velocity) => {
        console.log(`MIDI noteOn on pad (standard mode) on ${port}: note ${note} / velocity ${velocity}`)
    })

    launchkey.on('padOff', (port,note,velocity) => {
        console.log(`MIDI noteOff on pad (standard mode) on on ${port}: note ${note} / velocity ${velocity}`)
    })

    launchkey.on('cc', (port,control,value) => {
        console.log(`MIDI CC on ${port}: control ${control} / value ${value}`)
    })

})

launchkey.on('error', err => {
	console.error('Error occured:', err)
})

launchkey.connect()