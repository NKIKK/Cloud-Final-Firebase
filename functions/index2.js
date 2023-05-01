const functions = require('@google-cloud/functions-framework');
const { user } = require('firebase-functions/v1/auth');
require("dotenv").config();

const request = require('request-promise');
const server_api_url = "http://18.221.215.103/api";
// require('dotenv').config();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_DATA = 'https://api-data.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer VffI/iUWl3LF20y5M5yr5lbp6sJl9tgyHT5TgDmEtB4S/XQ4AWzmCVI3CL7rhwBeLUcfhA+VT53KHYGUZqoVPSyb2j7l+0ANgFvQ+nMCMYA4sxOBkPmRF8NefOXfxF3aVf55UfYbSQtROkANBzDCsAdB04t89/1O/w1cDnyilFU=`,
};

functions.http('LineBot',async (req, res) => {
// res.status(200).send('HTTP with Node.js in GCF 2nd gen!');
  // functions.logger.log("req = ", req);
  // functions.logger.log("req body = ", req.body);
  console.log("req  events = ", req.body.events);
  // const scoreBoard = getScore({
  //   messageId:req.body.events[0].message.id,
  //   userId:req.body.events[0].source.userId})
  //   res.send("hello score");
  //   return;
    const type = req.body.events[0].message.type
    const userId = req.body.events[0].source.userId;
    const replyToken = req.body.events[0].replyToken;

        if ( type== 'text') {
          const message = req.body.events[0].message.text
          const txt = message.split(" ");
        //   if (message=="all")
        //   {
        //     replyAllScoreBoard({
        //         replyToken:replyToken
        //     })
        //   }
        //   else 
          if(txt[0]=='a')
          {
            console.log("message type text a ");
            // get audio
            a = parseInt(txt[1])
            if(a>=1 && a<=10)
            {
              const audioFile = await getAudioTrack({
                userId: userId,
                audioNumber:a,
              })
              const audioJson = JSON.parse(audioFile);
              console.log("valid a",a);
            console.log("audioFile",audioFile);
            try {
              await replyAudio({
                replyToken:replyToken,
                // originalContentUrl: "https://line-data-cloud.s3.us-east-2.amazonaws.com/1.m4a",
                originalContentUrl: audioJson.audioUrl,
              })
              reply(req.body,"Timeout");
            console.log("audioJson.audioUrl",audioJson.audioUrl);

            }catch(err){
            console.log("catch replyAudio",err);

            }
              
              // return;
            }
            else  {
              res.send("hello 1-10");
            }
          }else if(txt[0]=='s')
          {
            // TODO: get score board
            const a = parseInt(txt[1])
            if(a>=1 && a<=10)
            {
                const res = await getScoreBoard({audioNumber:a,})
                const resJson = JSON.parse(res)
               
                await replyScoreBoard({
                    ranking:resJson,
                    userId:userId,
                    replyToken:replyToken,
                    audioNumber:a,

                })
            }else return;

          }
            reply(req.body);
        }else if(type == 'audio'){
          // TODO: Check score 
          console.log("message type audio ");

            const score = await getScore({
                replyToken:replyToken,
              messageId:req.body.events[0].message.id,
              userId:req.body.events[0].source.userId,
            })
              console.log("score ",score);
            const scoreJson = JSON.parse(score) ;
            
            const res = await getScoreBoard({audioNumber:parseInt(scoreJson.audioNumber),})
            const resJson = JSON.parse(res)
            await replyScoreAndScoreBoard({
                ranking:resJson,
                userId:userId,
                replyToken:replyToken,
                audioNumber:parseInt(scoreJson.audioNumber),
                score:scoreJson.score,
                transcription:scoreJson.transcription
            })
            
            //   reply(req.body,"Score: "+scoreJson.score+"\n Transcription: "+scoreJson.transcription);
            //   reply(req.body,"Your score is ...");
            // replyScoreBoard({...scoreBoard,replyToken:replyToken })
            return;
        }
        else {
            res.send("hello else");
            return;
        }

        res.send("hello6");
        // 
    // reply(req.body);
});

const getAudioTrack = (body) => {
  return request({
    method: `POST`,
    uri: `${server_api_url}/audio`,
    headers: LINE_HEADER,
    body: JSON.stringify({
          userId: body.userId,
          audioNumber:body.audioNumber,
    }),
  });
};


const getScore = async (bodyResponse) => {
  return await request({
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
    method: `GET`,
    uri: `${server_api_url}/scoreboard/${bodyResponse.audioNumber}`,    
  });
};
const replyAudio = (bodyResponse) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.replyToken,
      messages: [
        {
          type: `audio`,
          // originalContentUrl: `${LINE_DATA}/${bodyResponse.events[0].message.id}/content`,
          // originalContentUrl:"https://line-data-cloud.s3.us-east-2.amazonaws.com/1.m4a",
          originalContentUrl:bodyResponse.originalContentUrl,
          duration: 60000
        },
      ],
    }),
  });
};

const replyScoreAndScoreBoard = (body) => {
    
    let ranking = []
    body.ranking.map((user,idx)=>{
        ranking.push({
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
                    "text": `${idx+1}`,
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 1
                },
                {
                    "type": "text",
                    "text": `${user.userDisplayName??"-"}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5
                },
                {
                    "type": "text",
                    "text": `${user.userScore??"-"}`
                }
                ]
            }]
            
            })
    })
    const scoreboard_json = scoreBoardJson({
        ranking: ranking,
        audioNumber:body.audioNumber,
    })

  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
        replyToken: body.replyToken,
        messages: [
            yourResult(body.score,body.transcription),
            scoreboard_json
            ]
        }),
  });
};
const replyScoreBoard = (body) => {
    let ranking = []
    body.ranking.map((user,idx)=>{
        ranking.push({
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
                    "text": `${idx+1}`,
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 1
                },
                {
                    "type": "text",
                    "text": `${user.userDisplayName??"-"}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5
                },
                {
                    "type": "text",
                    "text": `${user.userScore??"-"}`
                }
                ]
            }]
            
            })
    })
    const scoreboard_json = scoreBoardJson({
        ranking: ranking,
        audioNumber:body.audioNumber,
    })

  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
        replyToken: body.replyToken,
        messages: [
            scoreboard_json
            ]
        }),
  });
};
const yourResult = (score,transcription)=>{
    return {type: "flex",
    altText: "This is your result",
    contents: 
    {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "คะแนน",
              "weight": "bold",
              "color": "#1DB446",
              "size": "sm"
            },
            {
              "type": "text",
              "text": `${score}/100`,
              "weight": "regular",
              "size": "xxl",
              "margin": "md"
            },
            {
              "type": "separator",
              "margin": "md"
            },
            {
              "type": "text",
              "text": "ฉันได้ยินคุณพูดว่า",
              "weight": "bold",
              "color": "#1DB446",
              "size": "sm",
              "margin": "xl"
            },
            {
              "type": "text",
              "text": `" ${transcription} "`,
              "weight": "regular",
              "size": "lg",
              "margin": "md"
            }
          ]
        },
        "styles": {
          "footer": {
            "separator": true
          }
        }
      }};
}
const allScoreBoardJson = async()=>{
    let allScore = []
    for(let i=1;i<=10;i++)
    {
        const res = await getScoreBoard({audioNumber:i,})
        const resJson = JSON.parse(res)
        let ranking = []
        resJson.map((user,idx)=>{
        ranking.push({
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
                    "text": `${idx+1}`,
                    "color": "#aaaaaa",
                    "size": "sm",
                    "flex": 1
                },
                {
                    "type": "text",
                    "text": `${user.userDisplayName??"-"}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "sm",
                    "flex": 5
                },
                {
                    "type": "text",
                    "text": `${user.userScore??"-"}`
                }
                ]
            }]
            
            })
    })
    const scoreboard_json = scoreBoardJson({
        ranking: ranking,
        audioNumber:i,
    })
    allScore.push(scoreboard_json)
    
    }
    return {
        "type": "carousel",
  "contents": allScore
    }
    
}
const replyAllScoreBoard = (body)=>{
    const all_scoreboard_json = allScoreBoardJson();
    return request({
        method: `POST`,
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
          replyToken: body.replyToken,
          messages: [
            {
              type: `flex`,
              altText: "This is your result",
                contents: 
                {
                    all_scoreboard_json
                }
            },
          ],
        }),
      });
}
const yourTranscriptionJson = (transcription)=>{
    return {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "ฉันได้ยินคุณพูดว่า",
              "weight": "bold",
              "color": "#1DB446",
              "size": "sm"
            },
            {
              "type": "text",
              "text": `" ${transcription} "`,
              "weight": "regular",
              "size": "lg",
              "margin": "md"
            }
          ]
        },
        "styles": {
          "footer": {
            "separator": true
          }
        }
      };
}
const yourScoreJson = (score) =>{
    return {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "ฉันให้คะแนนคุณ",
              "weight": "bold",
              "color": "#1DB446",
              "size": "sm"
            },
            {
              "type": "text",
              "text": `${score}/100`,
              "weight": "bold",
              "size": "xxl",
              "margin": "md"
            }
          ]
        },
        "styles": {
          "footer": {
            "separator": true
          }
        }
      };
}
const scoreBoardJson = (body)=>{
    const contents_list = [{
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
            "text": `Audio Number ${body.audioNumber}`,
            "size": "sm",
            "color": "#999999",
            "flex": 0
          }
        ]
      },]
      body.ranking.map((user)=>{
        contents_list.push(user);
      })
      return {
        type: "flex",
        altText: "This is score board",
        contents: 
        {
            type: "bubble",
            body: {
            type: "box",
            layout: "vertical",
            contents: [
                
                ...contents_list
            ]
            }
            ,
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                {
                    "type": "button",
                    "action": {
                    "type": "message",
                    "label": "Play",
                    "text": `a ${body.audioNumber}`
                    },
                    "style": "primary",
                    "height": "md"
                },
                {
                    "type": "button",
                    "action": {
                        "type": "message",
                        "label": "View Score Board",
                        "text": `s ${body.audioNumber}`
                    }
                }
                ]
            }
        }};
};

const reply = (bodyResponse,text) => {
    console.log(JSON.stringify({
        replyToken: bodyResponse.events[0].replyToken,
        messages: [
          {
            type: `text`,
            text: text,
          },
        ],
      }))
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




