"use strict";

const Novation = require("./Novation");

const CONTROLS = {
    ROTARY: [21, 22, 23, 24, 25, 26, 27, 28],
    UP: 0,
    DOWN: 0,
    LEFT: 0,
    RIGHT: 0,
    SCENE: [104, 120],
};

const LEDS = [
    [96, 97, 98, 99, 100, 101, 102, 103, 104],
    [112, 113, 114, 115, 116, 117, 118, 119, 120],
];

const BRIGHTNESS = {
    OFF: 0,
    LOW: 1,
    MID: 2,
    HIGH: 3,
};

// Implementation class for Novation Launchkey controllers
class Launchkey extends Novation {
    constructor(options = {}) {
        super(options);

        const {
            midiInput = "Launchkey Mini LK Mini MIDI",
            dawInput = "Launchkey Mini LK Mini InControl",
            midiOutput = "Launchkey Mini LK Mini MIDI",
            dawOutput = "Launchkey Mini LK Mini InControl",
            device = "Launchkey Mini Mk2",
        } = options;

        this.device = device;

        this.ports = {
            input: {
                midi: midiInput,
                daw: dawInput,
            },
            output: {
                midi: midiOutput,
                daw: dawOutput,
            },
        };
    }

    extendedMode = (enabled = true) => {
        this.noteOn(1, 12, enabled ? 127 : 0);
    };

    reset = () => {
        this.controlChange(1, 0, 0);
    };

    ledOnAll = (brightness = Novation.BRIGHTNESS.HIGH) => {
        this.controlChange(1, 0, 124 + brightness);
    };

    ledOn = (x, y, color = color()) => {
        const note = LEDS[y][x];
        const velocity = Launchkey.guardInt(color, 0, 127);

        this.noteOn(1, note, velocity);
    };

    ledOff = (x, y) => {
        this.ledOn(x, y, 0);
    };

    ledFlash = (enabled = true) => {
        const value = 32 + (enabled ? 8 : 0);
        this.controlChange(1, 0, value);
    };

    get name() {
        return this.device;
    }

    static guardInt = (value, min, max) => {
        return Math.min(Math.max(min, parseInt(value)), max);
    };

    static colorInt = (color) => {
        return Launchkey.guardInt(color, BRIGHTNESS.OFF, BRIGHTNESS.HIGH);
    };

    static color = (red = BRIGHTNESS.HIGH, green = BRIGHTNESS.HIGH) => {
        return Launchkey.colorInt(red) + Launchkey.colorInt(green) * 16;
    };

    static get CONTROLS() {
        return CONTROLS;
    }

    static get BRIGHTNESS() {
        return BRIGHTNESS;
    }
}

module.exports = Launchkey;
