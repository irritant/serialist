/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { render } from 'react-dom';
import classnames from 'classnames';
import { SerialistParser } from '../parser/serialist-parser';
import { SerialistPlayer } from '../player/serialist-player';
import { MIDISource, MIDIManager } from '../midi/';
/* eslint-enable no-unused-vars */

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
			transport: {},
			message: []
		};
	}

	componentDidMount() {
		document.addEventListener('serialist.transport.state', this.updateTransportState.bind(this));
		document.addEventListener('serialist.midi.message', this.updateMidiMessage.bind(this));
		this.refreshMIDIPorts();
	}

	componentWillUnmount() {
		document.removeEventListener('serialist.transport.state', this.updateTransportState);
		document.removeEventListener('serialist.midi.message', this.updateMidiMessage);
	}

	render() {
		return (
			<div className="serialist">
				<div className="header">
					<h1>Serialist</h1>
					<a href="https://irritantcreative.ca" target="_blank">
						<img className="logo" src="/images/irritant.png" />
					</a>
				</div>
				<div className="transport">
					<div className="controls">
						<button onClick={this.evaluateText.bind(this)} disabled={this.disableUpdateText()}>
							<i className={classnames('fa', 'fa-check')}></i>
						</button>
						<button onClick={this.playPause.bind(this)} disabled={this.disablePlayPause()}>
							<i className={
								classnames('fa',
									{'fa-play': !player.playing || player.paused},
									{'fa-pause': player.playing && !player.paused}
								)
							}></i>
						</button>
						<button onClick={this.stop.bind(this)} disabled={this.disableStop()}>
							<i className={classnames('fa', 'fa-stop')}></i>
						</button>
						<button onClick={this.reset.bind(this)}>
							<i className={classnames('fa', 'fa-ban')}></i>
						</button>
						<div className="select-wrap">
							<select onChange={this.updateMidiPort.bind(this)} disabled={this.disableUpdateMidiPort()}>
								<option value="">MIDI Port</option>
								{this.renderMidiPorts()}
							</select>
						</div>
					</div>
					{this.renderStatus()}
				</div>
				<div className="editor">
					<label>
						<span>Command</span>
						<textarea className="grammar" value={this.state.text} onChange={this.updateText.bind(this)} />
					</label>
					<label>
						<span>History</span>
						<textarea className="history" value={this.state.history.join('\n\n')} readOnly />
					</label>
				</div>
				{this.renderError()}
			</div>
		);
	}

	renderStatus() {
		const message = this.state.message;
		if (message.length === 3) {
			return (
				<div className="status">
					<span>note: {message[1]} velocity: {message[2]}</span>
				</div>
			);
		} else {
			return null;
		}
	}

	renderError() {
		let error = this.state.parseResult.error;
		if (error) {
			return (
				<div className="error">
					{error.message || 'Failed to parse the command.'}
				</div>
			);
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
			if (!player.playing && !player.paused) {
				this.setState({ message: [] });
			}
		}
	}

	updateMidiMessage(event) {
		if (event.detail.sender === player) {
			this.setState({ message: event.detail.message });
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

export { SerialistComponent };