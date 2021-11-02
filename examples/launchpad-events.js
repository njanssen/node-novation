"use strict";

const { Launchpad } = require("../lib");

const controller = new Launchpad();

controller.on("connected", () => {
    console.log(`Novation ${controller.name} controller ready`);

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
