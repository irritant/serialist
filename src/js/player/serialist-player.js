class SerialistPlayer {

	constructor() {
		this.worker = new Worker('/dist/serialist-player-worker.js');
		this.worker.addEventListener('message', message => {
			var { data } = message;
			switch (data.command) {
			case 'transport.state':
				this.updateTransportState(data.state);
				break;
			case 'midi.note.on':
				this.sendMidiNoteOn(data.midi);
				break;
			case 'midi.note.off':
				this.sendMidiNoteOff(data.midi);
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

	sendMidiNoteOn(midi) {
		var { note, velocity, channel } = midi;
		this.sendMidiMessage([0x90 + (channel - 1), note, velocity]);
	}

	sendMidiNoteOff(midi) {
		var { note, velocity, channel } = midi;
		this.sendMidiMessage([0x80 + (channel - 1), note, velocity]);
		this.sendMidiMessage([0x90 + (channel - 1), note, 0]);
	}

	sendMidiAllNotesOff() {
		for (let ch = 0; ch < 16; ch++) {
			this.sendMidiMessage([0xB0 + ch, 0x7B, 0]);
		}
	}

	sendMidiMessage(message) {
		if (this.midiPort) {
			this.midiPort.send(message);
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

export { SerialistPlayer };