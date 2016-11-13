import React, { Component } from 'react';
import { render } from 'react-dom';
import { SerialistParser } from '../parser/serialist-parser';
import { SerialistPlayer } from '../player/serialist-player';
import { MIDISource, MIDIManager } from '../midi/';

const parser = new SerialistParser();
const player = new SerialistPlayer();
const midi = new MIDIManager();

class SerialistComponent extends Component {

	constructor(props) {
		super(props);

		this.state = {
			history: [],
			text: '',
			parseResult: {},
			midiPorts: [],
			midiPortSelected: false,
			transport: {}
		};
	}

	componentDidMount() {
		this.refreshMIDIPorts();
		document.addEventListener('serialist.transport.state', this.updateTransportState.bind(this));
	}

	componentWillUnmount() {
		document.removeEventListener('serialist.transport.state', this.updateTransportState);
	}

	render() {
		return (
			<div className="serialist">
				<textarea className="serialist-history" readOnly
					value={this.state.history.join('\n\n')}
				/>
				<textarea className="serialist-input"
					value={this.state.text}
					onChange={this.updateText.bind(this)}
				/>
				{this.renderError()}
				<button onClick={this.evaluateText.bind(this)} disabled={this.disableUpdateText()}>
					Evaluate
				</button>
				<button onClick={this.playPause.bind(this)} disabled={this.disablePlayPause()}>
					{(player.playing && !player.paused) ? 'Pause' : 'Play'}
				</button>
				<button onClick={this.stop.bind(this)} disabled={this.disableStop()}>
					Stop
				</button>
				<button onClick={this.reset.bind(this)}>
					Reset
				</button>
				<select onChange={this.updateMidiPort.bind(this)} disabled={this.disableUpdateMidiPort()}>
					<option value="">MIDI Port</option>
					{this.renderMidiPorts()}
				</select>
			</div>
		)
	}

	renderError() {
		let error = this.state.parseResult.error;
		if (error) {
			return (
				<div className="serialist-error">
					{error.message || 'Unknown parser error.'}
				</div>
			)
		}

		return null;
	}

	renderMidiPorts() {
		return this.state.midiPorts.map(port => {
			return (
				<option key={port.id} value={port.id}>
					{port.name}
				</option>
			);
		});
	}

	updateTransportState(event) {
		if (event.detail.sender === player) {
			this.setState({ transport: event.detail.state });
		}
	}

	disablePlayPause() {
		var { midiPortSelected, text } = this.state;
		return !MIDISource.canUseMIDI() || !midiPortSelected || !text.length;
	}

	playPause() {
		if (player.playing && !player.paused) {
			player.pause();
		} else {
			player.play();
		}
	}

	disableStop() {
		var { transport, midiPortSelected } = this.state;
		return !MIDISource.canUseMIDI() || !midiPortSelected || (!transport.playing && !transport.paused);
	}

	stop() {
		player.stop();
	}

	disableUpdateText() {
		var { midiPortSelected, text } = this.state;
		return !MIDISource.canUseMIDI() || !midiPortSelected || !text.length;
	}

	reset() {
		player.reset();
	}

	updateText(event) {
		this.setState({
			text: event.target.value || ''
		});
	}

	evaluateText() {
		let text = this.state.text;
		if (text.length) {
			let parseResult = this.parseText(text);
			let history = (parseResult.status) ? [text, ...this.state.history] : this.state.history;

			if (parseResult.status && parseResult.data) {
				player.queueVoices(parseResult.data);
			}

			this.setState({
				parseResult,
				history
			});
		}
	}

	parseText(text) {
		return parser.parse(`flat ${text}`);
	}

	refreshMIDIPorts() {
		if (!MIDISource.canUseMIDI()) {
			return;
		}

		midi.refreshPorts().then(() => {
			this.setState({
				midiPorts: midi.orderedOutputPorts
			});
		});
	}

	disableUpdateMidiPort() {
		return !MIDISource.canUseMIDI();
	}

	updateMidiPort(event) {
		const portId = event.target.value;
		if (portId.length) {
			midi.midiSource.getOutputPortById(portId).then(port => {
				player.midiPort = port;
				this.setState({ midiPortSelected: true });
			});
		} else {
			player.stop();
			this.setState({ midiPortSelected: false });
		}
	}

}

export { SerialistComponent }