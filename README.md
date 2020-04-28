# node-novation

Node.js interface for Novation [Launchkey Mini](https://novationmusic.com/en/keys/launchkey-mini) and [Launchpad Mini](https://novationmusic.com/en/launch/launchpad-mini) controllers.

This library currently supports the following controllers:

*   Launchkey Mini Mk2
*   Launchpad Mini Mk3

## What does this library do?

This library supports the following interactions with Novation controllers:

*   Sending and receiving MIDI messages
*   Controlling LEDs
*   Enabling extended mode (InControl) on Launchkey Mini Mk2 controllers
*   Setting modes (e.g. DAW mode) and selecting layouts (e.g. Session layout) on Launchpad Mk3 controllers

## Installation

```
yarn add @vliegwerk/novation
```

or

```
npm install @vliegwerk/novation --save
```

## Basic usage

The following code can be used to initialize and connect to a Launchkey controller:

```
const { Launchkey } = require('@vliegwerk/novation')
const controller = new Launchkey()
controller.connect()
```

Similarly, you can use the following code for a Launchpad controller:

```
const { Launchpad } = require('@vliegwerk/novation')
const controller = new Launchpad()
controller.connect()
```

This code creates a new `Launchkey` or `Launchpad` instance which depends on the [midi](https://www.npmjs.com/package/midi) library for sending and receiving MIDI messages, and the [@lachenmayer/midi-messages](https://www.npmjs.com/package/@lachenmayer/midi-messages) library for encoding and decoding these MIDI messages.

The `Launchkey` and `Launchpad` classes emit an event whenever a MIDI message is received or when some error has occured. For instance, to listen for the keys pressed on a Launchkey controller:

```
const { Launchkey } = require('@vliegwerk/novation')
const controller = new Launchkey()

controller.on('connected', () => {
	controller.on('NoteOn', (message) => {
		console.log('NoteOn event:',message)
	})
}

controller.on('error', (err) => {
	console.error('Error occured:', err)
})

controller.connect()
```

The argument of the event listener contains a JSON version of the MIDI message sent by the controller. For example:

```
{
    type: 'NoteOn',
    channel: 1,
    note: 60,
    velocity: 34,
    port: 'Launchkey Mini LK Mini MIDI'
}
```

For more examples, see the `examples` folder in the [node-novation repository](https://github.com/njanssen/node-novation/tree/master/examples) on GitHub. Check out these examples to find out how to send messages to the controller to control LEDs, modes, and layouts.

## Extras

-   See the [License](LICENSE) file for license rights and limitations (MIT).
-   Pull Requests are welcome!
