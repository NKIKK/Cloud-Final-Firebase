const functions = require('firebase-functions');
require("dotenv").config();

const request = require('request-promise');
const server_api_url = "http://3.141.16.91/api";
// require('dotenv').config();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_DATA = 'https://api-data.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer VffI/iUWl3LF20y5M5yr5lbp6sJl9tgyHT5TgDmEtB4S/XQ4AWzmCVI3CL7rhwBeLUcfhA+VT53KHYGUZqoVPSyb2j7l+0ANgFvQ+nMCMYA4sxOBkPmRF8NefOXfxF3aVf55UfYbSQtROkANBzDCsAdB04t89/1O/w1cDnyilFU=`,
};

exports.LineBot = functions.https.onRequest((req, res) => {

  // functions.logger.log("req = ", req);
  // functions.logger.log("req body = ", req.body);
  functions.logger.log("req  events = ", req.body.events);
  // const scoreBoard = getScore({
  //   messageId:req.body.events[0].message.id,
  //   userId:req.body.events[0].source.userId})
  //   res.send("hello score");
  //   return;


        if (req.body.events[0].message.type == 'text') {
          
          txt = message.split(" ");
          if(txt[0]=='a')
          {
            // get audio
            a = parseInt(txt[1])
            if(a>=1 && a<=10)
            {
              audioFile = getAudioTrack({
                // replyToken: req.body.events[0].replyToken,
                userId: req.body.event[0].source.userId,
                audioNumber:a,
              })
              replyAudio({
                replyToken:req.body.events[0].replyToken,
                originalContentUrl: audioFile.audioUrl})
            }
            else  {
              res.send("hello 1-10");
            }
          }else if(txt[0]=='s')
          {
            // TODO: get score board
            // a = parseInt(txt[1])
            // if(a>=1 && a<=10)
            // {
            getScoreBoard(a)
            // }else return;

          }
            reply(req.body);
        }else if(req.body.events[0].message.type == 'audio'){
          // TODO: Check score 
          functions.logger.log("message type audio ");
            const scoreBoard = getScore({
              messageId:req.body.events[0].message.id,
              userId:req.body.event[0].source.userId})
              functions.logger.log("scoreBoard ",scoreBoard);
            reply(req.body,"Your score is ...");
            replyScoreBoard({...scoreBoard,replyToken:req.body.events[0].replyToken })
            // replyAudio(req.body);
        }
        else {
            res.send("hello else");
            return;
        }

        res.send("hello6");
        // 
    // reply(req.body);
});

const getAudioTrack = (bodyResponse) => {
  return request({
    method: `POST`,
    uri: `${server_api_url}/audio`,
    headers: LINE_HEADER,
    body: JSON.stringify({
          userId: bodyResponse.userId,
          audioNumber:bodyResponse.audioNumber,
    }),
  });
};

const getScore = (bodyResponse) => {
  return request({
    method: `POST`,
    uri: `${server_api_url}/score`,
    headers: LINE_HEADER,
    body: JSON.stringify({
          userId: bodyResponse.userId,
          messageId:bodyResponse.messageId,
    }),
  });
};
const getScoreBoard = (bodyResponse) => {
  return request({
    method: `POST`,
    uri: `${server_api_url}/score`,
    headers: LINE_HEADER,
    body: JSON.stringify({
          userId: bodyResponse.userId,
          messageId:bodyResponse.messageId,
    }),
  });
};

const replyScoreBoard = (bodyResponse) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: `flex`,
          context: {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "Score Board",
                  "weight": "bold",
                  "size": "xl"
                },
                {
                  "type": "box",
                  "layout": "baseline",
                  "contents": [
                    {
                      "type": "text",
                      "text": "Audio Number 1",
                      "size": "sm",
                      "color": "#999999",
                      "flex": 0
                    }
                  ]
                },
                {
                  "type": "box",
                  "layout": "vertical",
                  "margin": "lg",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "1st",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 1
                        },
                        {
                          "type": "text",
                          "text": "Shinjuku, Tokyo",
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 5
                        },
                        {
                          "type": "text",
                          "text": "120"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "baseline",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "text",
                          "text": "2nd",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 1
                        },
                        {
                          "type": "text",
                          "text": "User2",
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 5
                        },
                        {
                          "type": "text",
                          "text": "99"
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "baseline",
                      "contents": [
                        {
                          "type": "text",
                          "text": "3rd",
                          "color": "#aaaaaa",
                          "size": "sm",
                          "flex": 1
                        },
                        {
                          "type": "text",
                          "text": "-",
                          "wrap": true,
                          "color": "#666666",
                          "size": "sm",
                          "flex": 5
                        },
                        {
                          "type": "text",
                          "text": "-"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        },
      ],
    }),
  });
};

const reply = (bodyResponse,text) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: `text`,
          text: text,
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
// const replyAudio = (bodyResponse) => {
//     return request({
//       method: `POST`,
//       uri: `${LINE_MESSAGING_API}/reply`,
//       headers: LINE_HEADER,
//       body: JSON.stringify({
//         replyToken: bodyResponse.events[0].replyToken,
//         messages: [
//           {
//             type: `audio`,
//             // originalContentUrl: `${LINE_DATA}/${bodyResponse.events[0].message.id}/content`,
//             originalContentUrl:"https://line-data-cloud.s3.us-east-2.amazonaws.com/test.m4a",
//             duration: 60000
//           },
//         ],
//       }),
//     });
//   };




