/* eslint-disable no-unused-vars */
import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import Overlay from './overlay';
/* eslint-enable no-unused-vars */

class HelpOverlay extends Component {

	render() {
		if (this.props.visible) {
			return(
				<Overlay className="help-overlay">
					<h1 className="help-overlay-title">Tips &amp; Tricks</h1>
					<div className="help-overlay-content">
						<ul>
							<li>Review the <a href="https://github.com/irritant/serialist-grammar#syntax" target="_blank">serialist-grammar</a> syntax.</li>
							<li>Select a MIDI output port from the <em>MIDI Port</em> menu (OS X users can use the <em>IAC Driver Bus</em> to route MIDI messages to a DAW or software synth).</li>
							<li>Type your command in the <em>Command</em> field and click <i className="fa fa-check"></i> or press <em>Shift-Alt-Return</em> to evaluate and play.</li>
							<li>Control playback with the transport buttons or by pressing <em>Shift-Alt-Space</em> (play/pause) or <em>Shift-Ctrl-Alt-Space</em> (stop).</li>
							<li>Modify your command and re-evaluate as often as you like. Your previous commands will be listed in the <em>History</em> field.</li>
							<li>You can use the <a href="https://github.com/irritant/serialist-grammar#identifiers" target="_blank">serialist-grammar identifier syntax</a> to specify a MIDI channel for each voice. If you don't specify a MIDI channel, Serialist will send on channel 1.</li>
							<li>After playing, save any interesting commands by copying them from the <em>History</em> field to a text file on your computer.</li>
						</ul>
					</div>
					<button className="help-close-button" onClick={this.props.onClose}>
						Close
					</button>
				</Overlay>
			);
		}
		return null;
	}

}

HelpOverlay.propTypes = {
	visible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};

export default HelpOverlay;