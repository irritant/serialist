const SerialistGrammar = require('serialist-grammar');

class SerialistParseResult {

	constructor() {
		this.status = false;
		this.data = null;
		this.error = null;
	}

}

class SerialistParser {

	parse(text) {
		var result = new SerialistParseResult();

		try {
			result.data = SerialistGrammar.parse(text);
			result.status = true;
		} catch(error) {
			result.error = error;
		}

		return result;
	}

}

export default SerialistParser;