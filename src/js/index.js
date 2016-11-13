import React, { Component } from 'react'
import { render } from 'react-dom'
import { SerialistComponent } from './components/serialist-component'

require('../css/index.css');

window.addEventListener('load', () => {
	render(
		<SerialistComponent />,
		document.querySelector('.serialist-container')
	);
});