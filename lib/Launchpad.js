'use strict'

const Novation = require('./Novation')

const FADER_ORIENTATION = {
    VERTICAL: 0,
    HORIZONTAL: 1,
}

const FADER_TYPE = {
    UNIPOLAR: 0,
    BIPOLAR: 1,
}

const LED_CHANNEL = {
    STATIC: 1,
    FLASH: 2,
    PULSE: 3,
}

const LED_ADDRESS_TYPE = {
    STATIC: 0,
    FLASH: 1,
    PULSE: 2,
    RGB: 3,
}

const COLOR = {
    OFF: 0,
    WHITE_LOW: 1,
    WHITE_MID: 2,
    WHITE_HIGH: 3,
    RED: 5,
    YELLOW: 13,
    GREEN: 21
    // This is an incomplete list of colors.
    // For the complete list of colors, check the color palette in Programmer's Reference Manual
}

const CONTROLS = {
    UP: 91,
    DOWN: 92,
    LEFT: 93,
    RIGHT: 94,
    SESSION: 95,
    DRUMS: 96,
    KEYS: 97,
    USER: 98,
    LOGO: 99,
    SCENE1: 89,
    SCENE2: 79,
    SCENE3: 69,
    SCENE4: 59,
    SCENE5: 49,
    SCENE6: 39,
    SCENE7: 29,
    STOP_MUTE_SOLO: 19,
}

const LEDS = [
    [91, 92, 93, 94, 95, 96, 97, 98, 99],
    [81, 82, 83, 84, 85, 86, 87, 88, 89],
    [71, 72, 73, 74, 75, 76, 77, 78, 79],
    [61, 62, 63, 64, 65, 66, 67, 68, 69],
    [51, 52, 53, 54, 55, 56, 57, 58, 59],
    [41, 42, 43, 44, 45, 46, 47, 48, 49],
    [31, 32, 33, 34, 35, 36, 37, 38, 39],
    [21, 22, 23, 24, 25, 26, 27, 28, 29],
    [11, 12, 13, 14, 15, 16, 17, 18, 19],
]

/*
 * Implementation class for Novation Launchpad controllers
 *
 * User guide: https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20Mini%20User%20Guide.pdf
 * Programmer's reference manual: https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/Launchpad%20Mini%20-%20Programmers%20Reference%20Manual.pdf
 */
class Launchpad extends Novation {
    constructor(options = {}) {
        super(options)

        const {
            midiInput = 'Launchpad Mini MK3 LPMiniMK3 MIDI Out',
            dawInput = 'Launchpad Mini MK3 LPMiniMK3 DAW Out',
            midiOutput = 'Launchpad Mini MK3 LPMiniMK3 MIDI In',
            dawOutput = 'Launchpad Mini MK3 LPMiniMK3 DAW In',
            name = 'Launchpad Mini Mk3',
        } = options

        this.name = name

        this.deviceId = 0

        super.ports = {
            input: {
                midi: midiInput,
                daw: dawInput,
            },
            output: {
                midi: midiOutput,
                daw: dawOutput,
            },
        }
    }

    sysEx = (data, port = 'daw') => {
        this.outputs.encoders[port].sysEx(this.deviceId, [32, 41, 2, 13, ...data])
    }

    raw = (data, port = 'daw') => {
        this.outputs.encoders[port].write(data)
    }

    deviceInquiry = () => {
        this.outputs.encoders.daw.sysEx(126, [127, 6, 1])
    }

    queryMode = () => {
        this.sysEx([16])
    }

    dawMode = (enabled = true) => {
        this.sysEx([16, enabled ? 1 : 0])
    }

    dawClear = (clearSession = true, clearFaders = true) => {
        this.sysEx([18, clearSession ? 1 : 0, 0, clearFaders ? 1 : 0])
    }

    programmerMode = (enabled = true) => {
        this.sysEx([14, enabled ? 1 : 0])
    }

    ledSession = (active = 0, inactive = COLOR.WHITE_LOW) => {
        this.sysEx([20, active, inactive])
    }

    ledCtrlOn = (control, color = 1, channel = LED_CHANNEL.STATIC) => {
        this.controlChange(channel, control, color)
    }

    ledCtrlOff = (control) => {
        this.ledCtrlOn(control, 0)
    }

    ledOn = (x, y, color = 3, channel = LED_CHANNEL.STATIC) => {
        const led = LEDS[y][x]
        const controls = Object.values(CONTROLS)

        if (controls.indexOf(led) == -1) {
            this.noteOn(channel, led, color)
        } else {
            this.controlChange(channel, led, color)
        }
    }

    ledOff = (x, y) => {
        this.ledOn(x, y, 0)
    }

    ledPrgOn = (x, y, color = [1, 1, 1], lightingType = LED_ADDRESS_TYPE.RGB) => {
        const index = LEDS[y][x]

        switch (lightingType) {
            case LED_ADDRESS_TYPE.STATIC:
            case LED_ADDRESS_TYPE.PULSE:
                this.sysEx([3, lightingType, index, color * 127])
                break
            case LED_ADDRESS_TYPE.FLASH:
                this.sysEx([3, lightingType, index, color[0] * 127, color[1] * 127])
                break
            case LED_ADDRESS_TYPE.RGB:
                this.sysEx([3, lightingType, index, color[0] * 127, color[1] * 127, color[2] * 127])
                break
        }
    }

    ledPrgOff = (x, y) => {
        this.ledPrgOn(x, y, 0, 0, 0)
    }

    queryLayout = () => {
        this.sysEx([0])
    }

    layoutSession = () => {
        this.sysEx([0, 0])
    }

    layoutFader = () => {
        this.sysEx([0, 13])
    }

    layoutDrums = () => {
        this.sysEx([0, 4])
    }

    layoutKeys = () => {
        this.sysEx([0, 5])
    }

    layoutUser = () => {
        this.sysEx([0, 6])
    }

    layoutProgrammer = () => {
        this.sysEx([0, 127])
    }

    dawFaders = (faders = [], orientation = FADER_ORIENTATION.VERTICAL) => {
        const faderData = []

        const indices = Object.keys(faders)

        // Add fader SysEx data for configured faders
        indices.map((index) => {
            const {
                type = FADER_TYPE.UNIPOLAR,
                cc = 1,
                color = COLOR.GREEN, // Green
            } = faders[index]

            faderData.push(index, type, cc, color)
        })

        // Disable faders indices that have not been configured by setting their color to black
        for (let index = 0; index < 8; index++) {
            if (indices.indexOf(index.toString()) == -1) {
                faderData.push(index, FADER_TYPE.UNIPOLAR, 0, COLOR.OFF)
            }
        }

        this.sysEx([1, 0, orientation, ...faderData])
    }

    standaloneMode = () => {
        this.dawMode(false)
    }

    sleep = (enabled = true) => {
        this.sysEx([9, enabled ? 0 : 1])
    }

    awake = () => {
        this.sleep(false)
    }

    static color = (red = BRIGHTNESS.HIGH, green = BRIGHTNESS.HIGH, blue = BRIGHTNESS.HIGH) => {
        //return Launchkey.colorInt(red)*1 + Launchkey.colorInt(green)*16
        return 3
    }

    static get FADER_ORIENTATION() {
        return FADER_ORIENTATION
    }

    static get FADER_TYPE() {
        return FADER_TYPE
    }

    static get COLOR() {
        return COLOR
    }

    static get CONTROLS() {
        return CONTROLS
    }
}

module.exports = Launchpad
