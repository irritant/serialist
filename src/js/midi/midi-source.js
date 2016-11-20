class MIDISource {

	requestMIDIAccess() {
		return navigator.requestMIDIAccess();
	}

	getInputPorts() {
		return this.requestMIDIAccess().then(access => {
			return access.inputs;
		});
	}

	getInputPortById(portId) {
		return this.getInputPorts().then(inputs => {
			return inputs.get(portId);
		});
	}

	getOutputPorts() {
		return this.requestMIDIAccess().then(access => {
			return access.outputs;
		});
	}

	getOutputPortById(portId) {
		return this.getOutputPorts().then(outputs => {
			return outputs.get(portId);
		});
	}

}

MIDISource.canUseMIDI = function() {
	return (typeof navigator.requestMIDIAccess === 'function');
};

export default MIDISource;