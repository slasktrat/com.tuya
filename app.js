'use strict';

const 	Homey 				= require('homey');

class TuyaApp extends Homey.App {
	
	onInit() {
		this.log('Tuya app is running...');
	}

}

module.exports = TuyaApp;