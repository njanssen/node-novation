'use strict'

const Novation = require('../')
const launchkey = new Novation()

launchkey.on('ready', () => {
    console.log('Novation controller ready')

    launchkey.extendedMode()

    launchkey.reset()


    // launchkey.noteOn(97,launchkey.color(2/3,0))
    // launchkey.noteOn(98,launchkey.color(1,0))

    // launchkey.noteOn(99,launchkey.color(1/3,1/3))
    // launchkey.noteOn(100,launchkey.color(2/3,2/3))
    // launchkey.noteOn(101,launchkey.color(1,1))

    // launchkey.noteOn(112,launchkey.color(0,0))
    // launchkey.noteOn(113,launchkey.color(0,1/3))
    // launchkey.noteOn(114,launchkey.color(0,2/3))
    // launchkey.noteOn(115,launchkey.color(0,1))

    // launchkey.noteOn(117,launchkey.color(1/3,1/3))
    // launchkey.noteOn(118,launchkey.color(1/3,2/3))
    // launchkey.noteOn(119,launchkey.color(1/3,1))




    launchkey.on('noteOn', (port,note,velocity) => {
        console.log(`MIDI noteOn on ${port}: note ${note} / velocity ${velocity}`)

        const intensity = (velocity/127)+0.25
        const color = launchkey.color(intensity,intensity)

        if (note >= 96 && note <= 103 || note >= 112 && note <= 119) {
            // Pads (InControl mode)
            launchkey.noteOn(note,color)
        }

        if (note == 104) {
            // Scene up (InControl mode)
            launchkey.noteOn(note,color)
        }

        if (note == 120) {
            // Scene down (InControl mode)
            launchkey.noteOn(note,color)
        }

    })

    launchkey.on('noteOff', (port,note,velocity) => {
        console.log(`MIDI noteOff on ${port}: note ${note} / velocity ${velocity}`)

        if (note >= 96 && note <= 103 || note >= 112 && note <= 119) {
            // Pads
            launchkey.noteOn(note,launchkey.color(0,0))
        }

        if (note == 104 || note == 120) {
            // Scane up / Scene down
            launchkey.noteOn(note,launchkey.color(0,0))
        }
    })

    launchkey.on('padOn', (port,note,velocity) => {
        console.log(`MIDI noteOn on pad (standard mode) on ${port}: note ${note} / velocity ${velocity}`)
    })

    launchkey.on('padOff', (port,note,velocity) => {
        console.log(`MIDI noteOff on pad (standard mode) on on ${port}: note ${note} / velocity ${velocity}`)
    })

    let r = 0
    let g = 0

    launchkey.on('cc', (port,control,value) => {
        console.log(`MIDI CC on ${port}: control ${control} / value ${value}`)

        if (control == 21) r = value/127
        if (control == 22) g = value/127

        for (let i=21; i<29; i++) {
            const note1 = 75+i
            const note2 = 91+i
            launchkey.noteOn(note1,launchkey.color(r,g))
            launchkey.noteOn(note2,launchkey.color(r,g))
        }
    })

})

launchkey.on('error', err => {
	console.error('Error occured:', err)
})

launchkey.connect()
