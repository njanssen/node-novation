"use strict";

const { Launchpad } = require("../lib");

const controller = new Launchpad();

controller.on("connected", () => {
    console.log(`Novation ${controller.name} controller ready`);

    controller.dawMode();
    controller.dawClear();

    // Set Session LED to yellow
    controller.ledSession(Launchpad.COLOR.YELLOW);

    // Configure DAW fader layout
    controller.dawFaders({
        0: {
            cc: 1,
            // Use default color (green)
            // Use default fader type (unipolar)
        },
        1: {
            cc: 2,
            color: Launchpad.COLOR.RED, // yellow
            type: Launchpad.FADER_TYPE.BIPOLAR,
        },
        2: {
            cc: 3,
            color: Launchpad.COLOR.YELLOW, // yellow
            type: Launchpad.FADER_TYPE.UNIPOLAR,
        },
    });
    controller.layoutFader();

    controller.ledCtrlOn(Launchpad.CONTROLS.LOGO, Launchpad.COLOR.YELLOW);
    controller.ledCtrlOn(
        Launchpad.CONTROLS.STOP_MUTE_SOLO,
        Launchpad.COLOR.WHITE_LOW
    );

    controller.on("NoteOn", (message) => {
        console.log("NoteOn event:", message);
    });

    controller.on("NoteOff", (message) => {
        console.log("NoteOff event:", message);
    });

    controller.on("ControlChange", (message) => {
        console.log("CC event:", message);
    });
});

controller.on("error", (err) => {
    console.error("Error occured:", err);
});

controller.connect();
