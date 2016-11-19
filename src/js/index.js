/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { render } from 'react-dom';
import Serialist from './components/serialist';
/* eslint-enable no-unused-vars */

window.addEventListener('load', () => {
	render(
		<Serialist />,
		document.querySelector('.serialist-container')
	);
});