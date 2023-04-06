const functions = require('firebase-functions');
require("dotenv").config();

const request = require('request-promise');
// require('dotenv').config();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_DATA = 'https://api-data.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer VffI/iUWl3LF20y5M5yr5lbp6sJl9tgyHT5TgDmEtB4S/XQ4AWzmCVI3CL7rhwBeLUcfhA+VT53KHYGUZqoVPSyb2j7l+0ANgFvQ+nMCMYA4sxOBkPmRF8NefOXfxF3aVf55UfYbSQtROkANBzDCsAdB04t89/1O/w1cDnyilFU=`,
};

exports.LineBot = functions.https.onRequest((req, res) => {

        if (req.body.events[0].message.type == 'text') {
            reply(req.body);
        }else if(req.body.events[0].message.type == 'audio'){
            replyAudio(req.body);
        }
        else {
            return;
        }
    
    // reply(req.body);
});

const reply = (bodyResponse) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: `text`,
          text: bodyResponse.events[0].message.text,
        },
      ],
    }),
  });
};

const replyAudio = (bodyResponse) => {
    return request({
      method: `POST`,
      uri: `${LINE_MESSAGING_API}/reply`,
      headers: LINE_HEADER,
      body: JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [
          {
            type: `audio`,
            // originalContentUrl: `${LINE_DATA}/${bodyResponse.events[0].message.id}/content`,
            originalContentUrl:"https://line-data-cloud.s3.us-east-2.amazonaws.com/test.m4a",
            duration: 60000
          },
        ],
      }),
    });
  };




