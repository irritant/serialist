/* eslint-disable no-unused-vars */
import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import classnames from 'classnames';
/* eslint-enable no-unused-vars */

class Overlay extends Component {

	render() {
		return(
			<div className={classnames('overlay', this.props.className)}>
				{this.props.children}
			</div>
		);
	}

}

Overlay.propTypes = {
	className: PropTypes.string
};

export default Overlay;