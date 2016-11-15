/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { render } from 'react-dom';
import { SerialistComponent } from './components/serialist-component';
/* eslint-enable no-unused-vars */

window.addEventListener('load', () => {
	render(
		<SerialistComponent />,
		document.querySelector('.serialist-container')
	);
});