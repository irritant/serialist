class SerialistVoiceQueue {

	constructor() {
		this.timer = 0;

		this.playing = false;
		this.paused = false;
		this.position = 0;

		this.note = 0;
		this.velocity = 0;
		this.channel = 1;

		this.voiceData = {
			id: 1,
			pc: [],
			oct: [],
			dyn: [],
			dur: []
		};
	}

	queueVoice(voice) {
		Object.keys(this.voiceData).forEach(key => {
			if (key === 'id') {
				var id = parseInt(voice[key]);
				this.voiceData[key] = isNaN(id) ? 1 : id;
			} else {
				this.voiceData[key] = voice[key] || [];
			}
		});
	}

	hasVoiceData() {
		return Object.keys(this.voiceData).filter(key => {
			return this.voiceData[key].length > 0;
		}).length > 0;
	}

	play() {
		if (!this.playing) {
			this.playing = true;
			this.paused = false;
			this.advance();
		}
	}

	pause() {
		clearTimeout(this.timer);
		this.playing = false;
		this.paused = true;
		this.sendMidiNoteOff(this.note, this.velocity, this.channel);
	}

	stop() {
		clearTimeout(this.timer);
		this.playing = false;
		this.paused = false;
		this.position = 0;
		this.sendMidiNoteOff(this.note, this.velocity, this.channel);
	}

	advance() {
		const { id, pc, oct, dyn, dur } = this.voiceData;
		const pos = this.position;

		const currentPc = pc[pos % pc.length] || 0;
		const currentOct = oct[pos % oct.length] || 0;
		const currentDyn = dyn[pos % dyn.length] || 0.5;
		const currentDur = dur[pos % dur.length] || 1;
		const interval = currentDur * 1000;

		this.note = ((currentOct + 4) * 12) + currentPc;
		this.velocity = Math.round(currentDyn * 127);
		this.channel = id;
		this.sendMidiNoteOn(this.note, this.velocity, this.channel);
		this.position += 1;

		this.timer = setTimeout(() => {
			if (this.playing && this.hasVoiceData()) {
				this.sendMidiNoteOff(this.note, this.velocity, this.channel);
				this.advance();
			} else {
				this.stop();
			}
		}, interval);
	}

	sendMidiNoteOn(note, velocity, channel) {
		self.postMessage({
			command: 'midi.note.on',
			midi: { note, velocity, channel }
		});
	}

	sendMidiNoteOff(note, velocity, channel) {
		self.postMessage({
			command: 'midi.note.off',
			midi: { note, velocity, channel }
		});
	}

}

class SerialistVoiceQueueManager {

	constructor() {
		this.queues = [];
	}

	play() {
		this.sendTransportState({
			playing: true,
			paused: false
		});

		this.queues.forEach(queue => {
			queue.play();
		});
	}

	pause() {
		this.queues.forEach(queue => {
			queue.pause();
		});

		this.sendTransportState({
			playing: false,
			paused: true
		});
	}

	stop() {
		this.queues.forEach(queue => {
			queue.stop();
		});

		this.sendTransportState({
			playing: false,
			paused: false
		});
	}

	setVoices(voices) {
		var currentQueues = [...this.queues];
		// Clear the content of any existing queues beyond the
		// length of the new voices array:
		if (currentQueues.length > voices.length) {
			currentQueues.slice(voices.length).forEach(queue => {
				queue.queueVoice({});
			});
		}
		// Update the current voice queues or add new ones as necessary:
		this.queues = voices.map((voice, index) => {
			var queue = currentQueues[index];
			if (!queue) {
				queue = new SerialistVoiceQueue();
			}
			queue.queueVoice(voice);
			return queue;
		});
	}

	sendTransportState(state) {
		self.postMessage({
			command: 'transport.state',
			state
		});
	}

}

const manager = new SerialistVoiceQueueManager();

self.addEventListener('message', message => {
	switch (message.data.command) {
	case 'voices.queue':
		manager.setVoices(message.data.voices || []);
		manager.play();
		break;
	case 'transport.play':
		manager.play();
		break;
	case 'transport.pause':
		manager.pause();
		break;
	case 'transport.stop':
		manager.stop();
		break;
	default:
		break;
	}
});