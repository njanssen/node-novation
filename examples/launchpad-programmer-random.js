"use strict";

const { Launchpad } = require("../lib");

const controller = new Launchpad();

controller.on("connected", () => {
    console.log(`Novation ${controller.name} controller ready`);

    controller.programmerMode();

    setInterval(() => {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                controller.ledPrgOn(x, y, [
                    Math.random(),
                    Math.random(),
                    Math.random(),
                ]);
            }
        }
    }, 350);
});

controller.on("error", (err) => {
    console.error("Error occured:", err);
});

// Connect to controller
controller.connect();
