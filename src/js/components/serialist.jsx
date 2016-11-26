/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { render } from 'react-dom';
import classnames from 'classnames';
import MidiOverlay from './midi-overlay';
import HelpOverlay from './help-overlay';
import SerialistParser from '../parser/serialist-parser';
import SerialistPlayer from '../player/serialist-player';
import { MIDISource, MIDIManager } from '../midi/';
/* eslint-enable no-unused-vars */

const parser = new SerialistParser();
const player = new SerialistPlayer();
const midi = new MIDIManager();

class Serialist extends Component {

	constructor(props) {
		super(props);

		this.state = {
			text: '',
			parseResult: {},
			commandHistory: [],
			midiHistory: [],
			midiPorts: [],
			midiPortSelected: false,
			transport: {},
			message: [],
			helpVisible: false
		};
	}

	componentDidMount() {
		document.addEventListener('keyup', this.onKeyup.bind(this));
		document.addEventListener('serialist.transport.state', this.updateTransportState.bind(this));
		document.addEventListener('serialist.midi.messages', this.updateMidiHistory.bind(this));
		this.refreshMIDIPorts();
	}

	componentWillUnmount() {
		document.removeEventListener('keyup', this.onKeyup.bind(this));
		document.removeEventListener('serialist.transport.state', this.updateTransportState.bind(this));
		document.removeEventListener('serialist.midi.messages', this.updateMidiHistory.bind(this));
	}

	render() {
		return (
			<div className="serialist">
				<MidiOverlay visible={!MIDISource.canUseMIDI()} />
				<HelpOverlay visible={this.state.helpVisible} onClose={() => {
					this.setState({helpVisible: false});
				}} />
				<div className="header">
					<h1>Serialist</h1>
					<a href="https://irritantcreative.ca" target="_blank">
						<img className="logo" src="/images/irritant.png" />
					</a>
				</div>
				<div className="transport">
					<div className="controls">
						<button onClick={this.evaluateText.bind(this)} disabled={this.disableEvaluateText()}>
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
						<button onClick={this.help.bind(this)}>
							<i className={classnames('fa', 'fa-question')}></i>
						</button>
					</div>
				</div>
				<div className="editor">
					<label>
						<span>Current Command</span>
						<textarea className="grammar" value={this.state.text} onChange={this.updateText.bind(this)} />
					</label>
					<label>
						<span>Command History</span>
						<textarea className="command-history" value={this.state.commandHistory.join('\n\n')} readOnly />
					</label>
					<label>
						<span>MIDI History</span>
						<textarea className="midi-history" value={this.state.midiHistory.join('\n')} readOnly />
					</label>
				</div>
				{this.renderError()}
			</div>
		);
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

	onKeyup(event) {
		// Evaluate text: Shift-Alt-Enter
		// Play/Pause: Shift-Alt-Space
		// Stop: Ctrl-Shift-Alt-Space
		switch(event.which) {
		case 13: // Enter
			if (event.altKey && event.shiftKey) {
				event.preventDefault();
				this.evaluateText();
			}
			break;
		case 32: // Space
			if (event.altKey && event.shiftKey) {
				event.preventDefault();
				if (event.ctrlKey) {
					this.stop();
				} else {
					this.playPause();
				}
			}
			break;
		default:
			break;
		}
	}

	updateTransportState(event) {
		if (event.detail.sender === player) {
			this.setState({ transport: event.detail.state });
			if (!player.playing && !player.paused) {
				this.setState({ message: [] });
			}
		}
	}

	updateMidiHistory(event) {

		const messageTypes = {
			noteOn: 0x09,
			noteOff: 0x08,
			cc: 0x0B
		};

		if (event.detail.sender === player) {
			let messages = event.detail.messages.map(msg => {
				const status = msg[0] >> 4;
				const channel = (msg[0] & 0x0F) + 1;
				let text = '';
				switch(status) {
				case messageTypes.noteOn:
					text = `Channel: ${channel} Note On: ${msg[1]} Velocity: ${msg[2]}`;
					break;
				case messageTypes.noteOff:
					text = `Channel: ${channel} Note Off: ${msg[1]} Velocity: ${msg[2]}`;
					break;
				case messageTypes.cc:
					text = `Channel: ${channel} CC: ${msg[1]} Value: ${msg[2]}`;
					break;
				}
				return text;
			});

			let midiHistory = [...messages, ...this.state.midiHistory].slice(0, 50);
			this.setState({ midiHistory });
		}
	}

	disablePlayPause() {
		var { midiPortSelected, text } = this.state;
		return !MIDISource.canUseMIDI() || !midiPortSelected || !text.length;
	}

	playPause() {
		if (!this.disablePlayPause()) {
			if (player.playing && !player.paused) {
				player.pause();
			} else {
				player.play();
			}
		}
	}

	disableStop() {
		var { transport, midiPortSelected } = this.state;
		return !MIDISource.canUseMIDI() || !midiPortSelected || (!transport.playing && !transport.paused);
	}

	stop() {
		if (!this.disableStop()) {
			player.stop();
		}
	}

	reset() {
		player.reset();
	}

	help() {
		this.setState({helpVisible: true});
	}

	updateText(event) {
		this.setState({
			text: event.target.value || ''
		});
	}

	disableEvaluateText() {
		var { midiPortSelected, text } = this.state;
		return !MIDISource.canUseMIDI() || !midiPortSelected || !text.length;
	}

	evaluateText() {
		if (!this.disableEvaluateText()) {
			let text = this.state.text;
			if (text.length) {
				let parseResult = this.parseText(text);
				let commandHistory = (parseResult.status) ? [text, ...this.state.commandHistory] : this.state.commandHistory;

				if (parseResult.status && parseResult.data) {
					player.queueVoices(parseResult.data);
				}

				this.setState({
					parseResult,
					commandHistory
				});
			}
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

export default Serialist;