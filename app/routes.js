"use strict";
const axios = require('axios');
const router = require('express').Router();

router.get('/test', async(req, res) => {

    try {
        console.log(process.env.JWT)
        const token = process.env.JWT;
        const email = 'taiwa.agency@gmail.com'; //host email id
        const result = await axios.get("https://api.zoom.us/v2/users/" + email, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });

        const result2 = await axios.post("https://api.zoom.us/v2/users/" + email + "/meetings", {
            "topic": "Discussion about today's Demo",
            "type": 2,
            "start_time": "2021-03-18T17:00:00",
            "duration": 20,
            "timezone": "India",
            "password": "1234567",
            "agenda": "We will discuss about Today's Demo process",
            "settings": {
                "host_video": true,
                "participant_video": true,
                "cn_meeting": false,
                "in_meeting": true,
                "join_before_host": false,
                "mute_upon_entry": false,
                "watermark": false,
                "use_pmi": false,
                "approval_type": 2,
                "audio": "both",
                "auto_recording": "local",
                "enforce_login": false,
                "registrants_email_notification": false,
                "waiting_room": true,
                "allow_multiple_devices": true
            }
        }, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'User-Agent': 'Zoom-api-Jwt-Request',
                'content-type': 'application/json'
            }
        });

        const mailgun = require("mailgun-js");
        const DOMAIN = process.env.DOMAIN_MAILGUN;
        const mg = mailgun({ apiKey: process.env.KEY_MAILGUN, domain: DOMAIN });
        const bod = result2.data
        let html = `
            <h3>Hello Taiwa</h3>
            <p> Ceci est un test Zoom</p>
            <p>Voici une nouvelle license de crée</p>
            <ul>
                <li>dateExpired: Rendez-vous sur Meet le 10/08/2022</li>
                <li>Datas: ${JSON.stringify(bod)}</li>
                <li>URL de Zoom: ${bod.start_url}</li>
                <li>URL du Join: ${bod.start_url}</li>
                <li>Password: ${bod.password}</li>
            </ul>
        `
        const data = {
            from: 'Boyer Julien <julien@taiwa.fr>',
            to: 'j.boyer69003@gmail.com',
            subject: 'Evenement de Sophrologie plannifié',
            html
        };
        let body = await mg.messages().send(data)
        console.log(body);

        return res.json(result2.data)
    } catch (error) {
        console.log(error.message);
        return res.json(false)
    }

});





module.exports = router;