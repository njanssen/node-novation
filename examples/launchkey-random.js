"use strict";

const { Launchkey } = require("../lib");

const controller = new Launchkey();

controller.on("connected", () => {
    console.log(`Novation ${controller.name} controller ready`);

    controller.extendedMode();
    controller.reset();

    setInterval(() => {
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 2; y++) {
                controller.ledOn(
                    x,
                    y,
                    Launchkey.color(Math.random() * 4, Math.random() * 4)
                );
            }
        }
    }, 350);
});

controller.on("error", (err) => {
    console.error("Error occured:", err);
});

// Connect to controller
controller.connect();
