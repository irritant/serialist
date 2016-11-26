class SerialistPlayer {

	constructor() {
		this.worker = new Worker('/dist/serialist-player-worker.js');
		this.worker.addEventListener('message', message => {
			var { data } = message;
			switch (data.command) {
			case 'transport.state':
				this.updateTransportState(data.state);
				break;
			case 'midi.messages':
				this.sendMidiMessages(data.messages);
				break;
			default:
				break;
			}
		});

		this.midiPort = null;
		this.playing = false;
		this.paused = false;
	}

	updateTransportState(state) {
		this.playing = state.playing;
		this.paused = state.paused;

		document.dispatchEvent(new CustomEvent('serialist.transport.state', {
			detail: { sender: this, state }
		}));
	}

	sendMidiAllNotesOff() {
		for (let ch = 0; ch < 16; ch++) {
			this.sendMidiMessage([0xB0 + ch, 0x7B, 0]);
		}
	}

	sendMidiMessages(messages) {
		messages.forEach(message => {
			this.sendMidiMessage(message);
		});
	}

	sendMidiMessage(message) {
		if (this.midiPort) {
			this.midiPort.send(message);
		}

		document.dispatchEvent(new CustomEvent('serialist.midi.message', {
			detail: { sender: this, message }
		}));
	}

	queueVoices(voices) {
		this.worker.postMessage({
			command: 'voices.queue',
			voices: voices
		});
	}

	play() {
		this.worker.postMessage({
			command: 'transport.play'
		});
	}

	pause() {
		this.worker.postMessage({
			command: 'transport.pause'
		});
	}

	stop() {
		this.worker.postMessage({
			command: 'transport.stop'
		});
	}

	reset() {
		this.sendMidiAllNotesOff();
	}

}

export default SerialistPlayer;