"use strict";

const EventEmitter = require("events");
const libmidi = require("midi");
const { EncodeStream, DecodeStream } = require("@lachenmayer/midi-messages");

// Base class for Novation controllers
class Novation extends EventEmitter {
    constructor(options = {}) {
        super();

        const {
            useRunningStatus = false,
            ignoreSysEx = true,
            ignoreTiming = true,
            ignoreActiveSensing = true,
            debug = false,
        } = options;

        this.useRunningStatus = useRunningStatus;
        this.debug = debug;

        // Set in constructor by subclass
        // this.ports = {
        // 	input : {
        // 		midi : undefined,
        // 		daw : undefined
        // 	},
        // 	output : {
        // 		midi : undefined,
        // 		daw : undefined,
        // 	}
        // }

        this.inputs = {
            ports: {
                midi: new libmidi.Input(),
                daw: new libmidi.Input(),
            },
            decoders: {
                midi: new DecodeStream(),
                daw: new DecodeStream(),
            },
        };

        this.outputs = {
            ports: {
                midi: new libmidi.Output(),
                daw: new libmidi.Output(),
            },
            encoders: {
                midi: new EncodeStream({
                    useRunningStatus: this.useRunningStatus,
                }),
                daw: new EncodeStream({
                    useRunningStatus: this.useRunningStatus,
                }),
            },
        };

        this.inputs.ports.daw.ignoreTypes(
            ignoreSysEx,
            ignoreTiming,
            ignoreActiveSensing
        );

        libmidi
            .createReadStream(this.inputs.ports.midi)
            .pipe(this.inputs.decoders.midi);

        libmidi
            .createReadStream(this.inputs.ports.daw)
            .pipe(this.inputs.decoders.daw);

        this.inputs.decoders.midi.on("data", (message) => {
            message["port"] = this.ports.input.midi;
            if (this.debug) console.log("MIDI decoder event:", message);
            this.handleMessage(message);
        });

        this.inputs.decoders.daw.on("data", (message) => {
            message["port"] = this.ports.input.daw;
            if (this.debug) console.log("MIDI decoder event:", message);
            this.handleMessage(message);
        });

        this.outputs.encoders.midi.pipe(
            libmidi.createWriteStream(this.outputs.ports.midi)
        );

        this.outputs.encoders.daw.pipe(
            libmidi.createWriteStream(this.outputs.ports.daw)
        );
    }

    handleMessage = (message) => {
        this.emit(message.type, message);
    };

    detectPorts = () => {
        const ports = {
            input: Array.from(
                { length: this.inputs.ports.midi.getPortCount() },
                (value, port) => {
                    return this.inputs.ports.midi.getPortName(port);
                }
            ),
            output: Array.from(
                { length: this.outputs.ports.midi.getPortCount() },
                (value, port) => {
                    return this.outputs.ports.midi.getPortName(port);
                }
            ),
        };

        if (this.debug) {
            console.log("Detected MIDI input ports:", ports.input);
            console.log("Detected MIDI output ports:", ports.output);
        }

        return ports;
    };

    connect = () => {
        const detectedPorts = this.detectPorts();

        const deviceInputPorts = this.ports.input;
        const deviceOutputPorts = this.ports.output;

        Object.keys(deviceInputPorts).map((type) => {
            const portName = deviceInputPorts[type];

            const portIdx = detectedPorts.input.indexOf(portName);

            if (portIdx < 0) {
                if (this.debug)
                    console.log(`Input port ${portName} is not available`);
                return;
            }

            if (this.debug)
                console.log(`Connecting input ${portIdx} (${portName})`);

            this.inputs.ports[type].openPort(portIdx);
        });

        Object.keys(deviceOutputPorts).map((type) => {
            const portName = deviceOutputPorts[type];

            const portIdx = detectedPorts.output.indexOf(portName);

            if (portIdx < 0) {
                if (this.debug)
                    console.log(`Output port ${portName} is not available`);
                return;
            }

            if (this.debug)
                console.log(`Connecting output ${portIdx} (${portName})`);

            this.outputs.ports[type].openPort(portIdx);
        });

        if (this.connected()) {
            this.emit("connected");
            return true;
        } else {
            this.emit("error", "Unable to connect");
            return false;
        }
    };

    connected = () => {
        return (
            this.inputs.ports.midi.isPortOpen() &&
            this.inputs.ports.daw.isPortOpen() &&
            this.outputs.ports.midi.isPortOpen() &&
            this.outputs.ports.daw.isPortOpen()
        );
    };

    disconnect = () => {
        this.inputs.ports.midi.closePort();
        this.inputs.ports.daw.closePort();
        this.outputs.ports.midi.closePort();
        this.outputs.ports.daw.closePort();
        if (!this.connected()) {
            this.emit("disconnected");
            return true;
        } else {
            this.emit("error", "Unable to disconnect");
            return false;
        }
    };

    sendMessage = (message, port = "daw") => {
        this.outputs.encoders[port].write(message);
    };

    noteOn = (channel, note, velocity, port = "daw") => {
        this.outputs.encoders[port].noteOn(channel, note, velocity);
    };

    noteOff = (channel, note, velocity, port = "daw") => {
        this.outputs.encoders[port].noteOff(channel, note, velocity);
    };

    controlChange = (channel, control, value, port = "daw") => {
        this.outputs.encoders[port].controlChange(channel, control, value);
    };
}

module.exports = Novation;
