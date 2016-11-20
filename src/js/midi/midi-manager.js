import MIDISource from './midi-source';

class MIDIManager {

	constructor() {
		this.midiSource = new MIDISource();
		this.inputPorts = {};
		this.orderedInputPorts = [];
		this.outputPorts = {};
		this.orderedOutputPorts = [];
	}

	refreshPorts() {
		return this.midiSource.getInputPorts().then(inputs => {

			this.inputPorts = {};
			this.orderedInputPorts = [];

			inputs.forEach(port => {
				this.inputPorts[port.id] = port;
			});

			this.orderedInputPorts = Object.keys(this.inputPorts)
				.map(portId => {
					return this.inputPorts[portId];
				})
				.sort((a, b) => {
					if (a.name != b.name) {
						return a.name > b.name ? 1 : -1;
					} else {
						return 0;
					}
				});

			return this.midiSource.getOutputPorts();

		}).then(outputs => {

			this.outputPorts = {};
			this.orderedOutputPorts = [];

			outputs.forEach(port => {
				this.outputPorts[port.id] = port;
			});

			this.orderedOutputPorts = Object.keys(this.outputPorts)
				.map(portId => {
					return this.outputPorts[portId];
				})
				.sort((a, b) => {
					if (a.name != b.name) {
						return a.name > b.name ? 1 : -1;
					} else {
						return 0;
					}
				});

		});
	}

	resetPorts() {
		this.inputPorts = {};
		this.orderedInputPorts = [];
		this.outputPorts = {};
		this.orderedOutputPorts = [];
	}

}

export default MIDIManager;