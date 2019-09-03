'use strict';

const   Homey               = require('homey'),
        _                   = require('lodash'),
        TuyaDevice          = require('tuyapi');

class MyDevice extends Homey.Device {
	
	onInit() {
        this._data = this.getData();
        this._counter = 1;

        this.log(`Tuya device ${this.getName()} ${this._data.localKey} has been initialized`);

        this._tuya = new TuyaDevice(
            {
                id: this._data.id,
                key: this._data.localKey
            });

        this.registerCapabilityListener('onoff', ( value, opts ) => {
            this._tuya.set({set: value}).then(result => {
                console.log('Result of setting status to ' + value + ': ' + result);
            });
            return Promise.resolve();
        });

        this.startInterval();
	}

	startInterval() {
	    const self = this;
        this._tuya.find()
            .then((d) => {
                this.log('Device resolved', d);
                this.getTuyaData();
                setInterval(this.getTuyaData.bind(this), 15 * 1000);
            })
            .catch(e => {
                this.log('Error in startInterval, retrying in 30 seconds', e);
                setTimeout(self.startInterval.bind(self), Math.min(30, self._counter++ * 2) * 1000);
            });
        this._tuya.on('error', error => {
            this.log('Error!', error);
            this.setUnavailable("Something went wrong");
        });

    }

    getTuyaData()
    {
        this._tuya.connect()
            .then(()=>{
                this._tuya.get({schema: true}).then(status => {
                    console.log('Status:', status);
                    if (status.dps['1'] !== undefined) {
                        this.setCapabilityValue("onoff", status.dps['1']).catch((e) => this.error('onoff', e));
                        this.setCapabilityValue("measure_current", Number(status.dps['4'] || status.dps['18'] || 0) / 1000).catch((e) => this.error('measure_current', e));
                        this.setCapabilityValue("measure_power", Number(status.dps['5'] || status.dps['19'] || 0) / 10).catch((e) => this.error('measure_power', e));
                        this.setCapabilityValue("measure_voltage", Number(status.dps['6'] || status.dps['20'] || 0) / 10).catch((e) => this.error('measure_voltage', e));
                        this.setAvailable();
                    }
                }).catch(e => {
                    this.error('Failed to get data', e);
                    this.setUnavailable("Could not reach device");
                });
            })


        // 1 = state
        // 2 =
        // 4 = Current (mA)
        // 5 = Power (W) / 10
        // 6 = Voltage (V) / 10

        // tuya.set({set: !status}).then(result => {
        //     console.log('Result of setting status to ' + !status + ': ' + result);
        //
        //     tuya.get().then(status => {
        //         console.log('New status:', status);
        //         return;
        //     });
        // });
    }
}

module.exports = MyDevice;