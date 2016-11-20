/* eslint-disable no-unused-vars */
import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import Overlay from './overlay';
/* eslint-enable no-unused-vars */

class MidiOverlay extends Component {

	render() {
		if (this.props.visible) {
			return(
				<Overlay className="midi-overlay">
					<h1 className="midi-overlay-title">Sorry :(</h1>
					<p className="midi-overlay-message">
						Serialist requires a browser that supports the Web MIDI API.<br />
						Please try the latest version of <a href="https://www.google.com/intl/en/chrome/browser/desktop/index.html" target="_blank">Chrome</a> or <a href="http://www.opera.com" target="_blank">Opera</a>.
					</p>
				</Overlay>
			);
		}
		return null;
	}

}

MidiOverlay.propTypes = {
	visible: PropTypes.bool.isRequired
};

export default MidiOverlay;