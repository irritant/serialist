const now = () => {
	if (typeof performance !== 'undefined') {
		return performance.now();
	} else {
		return new Date().getTime();
	}
};

const invertMidiValue = value => {
	return (value >= 0) ? value : 127 + value;
};

const limitMidiValue = value => {
	return Math.min(Math.max(value, 0), 127);
};

const limitMidiChannel = value => {
	return Math.min(Math.max(value, 1), 16);
};

const midiNoteOnMessage = (note, velocity, channel) => {
	return [(0x09 << 4) + (channel - 1), note, velocity];
};

const midiNoteOffMessagePair = (note, velocity, channel) => {
	return [[(0x08 << 4) + (channel - 1), note, velocity], [(0x09 << 4) + (channel - 1), note, 0]];
};

const midiControllerMessage = (cc, value, channel) => {
	return [(0x0B << 4) + (channel - 1), cc, value];
};

const sendMidiMessages = messages => {
	self.postMessage({
		command: 'midi.messages',
		messages: messages
	});
};

class SerialistVoiceQueue {

	constructor() {
		this.timer = 0;
		this.startTime = 0;
		this.targetTime = 0;

		this.playing = false;
		this.paused = false;
		this.position = 0;

		this.noteValid = false;
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

		this.ccData = {};
	}

	queueVoice(voice) {
		// Queue note data:
		Object.keys(this.voiceData).forEach(key => {
			if (key === 'id') {
				var id = parseInt(voice[key]);
				this.voiceData[key] = isNaN(id) ? 1 : id;
			} else {
				this.voiceData[key] = voice[key] || [];
			}
		});

		// Queue CC data:
		let ccDataIn = {};

		Object.keys(voice).filter(key => {
			if (Object.keys(this.voiceData).indexOf(key) >= 0) {
				return false;
			} else {
				return /^cc[0-9]+$/i.test(key);
			}
		}).map(key => {
			return { key, value: key.match(/[0-9]+/) };
		}).filter(data => {
			let { value } = data;
			return Array.isArray(value) && value.length;
		}).forEach(data => {
			let { key, value } = data;
			let cc = limitMidiValue(parseInt(value[0]));
			ccDataIn[cc] = voice[key] || [];
		});

		this.ccData = ccDataIn;
	}

	hasVoiceData() {
		return Object.keys(this.voiceData).filter(key => {
			return this.voiceData[key].length > 0;
		}).length > 0;
	}

	hasCCData() {
		return Object.keys(this.ccData).filter(key => {
			return this.ccData[key].length > 0;
		}).length > 0;
	}

	hasData() {
		return this.hasVoiceData() || this.hasCCData();
	}

	play() {
		if (!this.playing) {
			this.playing = true;
			this.paused = false;
			this.startTime = now();
			this.advance();
		}
	}

	pause() {
		clearTimeout(this.timer);
		this.playing = false;
		this.paused = true;
		this.startTime = 0;
		this.targetTime = 0;
		this.sendCurrentNoteOffMessage();
	}

	stop() {
		clearTimeout(this.timer);
		this.playing = false;
		this.paused = false;
		this.position = 0;
		this.startTime = 0;
		this.targetTime = 0;
		this.sendCurrentNoteOffMessage();
	}

	advance() {
		const messages = [];
		const { id, pc, oct, dyn, dur } = this.voiceData;
		const pos = this.position;

		const pcPos = pos % pc.length;
		const octPos = pos % oct.length;
		const dynPos = pos % dyn.length;
		const durPos = pos % dur.length;

		// If no pitch class was provided, there cannot be a valid note.
		// This flag will be used to
		this.noteValid = !isNaN(pc[pcPos]);

		const currentPc = !isNaN(pc[pcPos]) ? pc[pcPos] : 0;
		const currentOct = !isNaN(oct[octPos]) ? oct[octPos] : 0;
		const currentDyn = !isNaN(dyn[dynPos]) ? dyn[dynPos] : 0.5;
		const currentDur = !isNaN(dur[durPos]) ? dur[durPos] : 1;
		const interval = currentDur * 1000;

		// Compensate the interval for timer drift:
		const drift = (now() - this.startTime) - this.targetTime;
		const compensatedInterval = Math.max(interval - drift, 0);

		this.channel = limitMidiChannel(id);

		if (this.noteValid) {
			this.note = limitMidiValue(((currentOct + 4) * 12) + currentPc);
			this.velocity = limitMidiValue(Math.round(currentDyn * 127));
		}

		// CC messages:
		Object.keys(this.ccData).map(cc => {
			const ccList = this.ccData[cc];
			const ccPos = pos % ccList.length;
			const value = !isNaN(ccList[ccPos]) ? ccList[ccPos] : 0;
			return { cc, value };
		}).forEach(data => {
			let { cc, value } = data;
			value = limitMidiValue(invertMidiValue(value));
			messages.push(midiControllerMessage(cc, value, this.channel));
		});

		// Note messages:
		messages.push(midiNoteOnMessage(this.note, this.velocity, this.channel));
		sendMidiMessages(messages);

		this.position += 1;
		this.targetTime += interval;

		this.timer = setTimeout(() => {
			if (this.playing && this.hasData()) {
				this.sendCurrentNoteOffMessage();
				this.advance();
			} else {
				this.stop();
			}
		}, compensatedInterval);
	}

	sendCurrentNoteOffMessage() {
		if (this.noteValid) {
			const messages = midiNoteOffMessagePair(this.note, this.velocity, this.channel);
			sendMidiMessages(messages);
		}
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