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
		const messages = [];
		for (let ch = 0; ch < 16; ch++) {
			messages.push([(0x0B << 4) + ch, 0x7B, 0]);
		}
		this.sendMidiMessages(messages);
	}

	sendMidiMessages(messages) {
		if (this.midiPort) {
			messages.forEach(message => {
				this.midiPort.send(message);
			});

			document.dispatchEvent(new CustomEvent('serialist.midi.messages', {
				detail: { sender: this, messages }
			}));
		}
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