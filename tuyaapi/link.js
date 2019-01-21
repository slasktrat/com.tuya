const   Homey 				= require('homey'),
        TuyaLink            = require('@tuyapi/link').wizard;

async function link(options) {

    // Start linking process
    const link = new TuyaLink({
        apiKey: Homey.env.API_KEY,
        apiSecret: Homey.env.API_SECRET,
        email: 'johndoe@example.com',
        password: 'examplepassword'
    });

    try {
        console.log('Initializing Tuya cloud');
        await link.init();
        console.log('Looking for device');
        return await link.linkDevice({ssid: options.ssid, wifiPassword: options.password, devices: 1, region: 'EU', timezone: '+01:00'});
    } catch (error) {
        console.log(error);
    }
}

module.exports = link;