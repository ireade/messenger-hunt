var Botkit = require('botkit')
var https = require("https")

var accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN
var port = process.env.PORT
var PHAccessToken = process.env.PH_ACCESS_TOKEN

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required but missing')
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required but missing')
if (!port) throw new Error('PORT is required but missing')
if (!PHAccessToken) throw new Error('PH_ACCESS_TOKEN is required by missing ')


/* *****************************

    SETUP BOT AND CONTROLLER

***************************** */

var controller = Botkit.facebookbot({
  access_token: accessToken,
  verify_token: verifyToken
})

var bot = controller.spawn()

controller.setupWebserver(port, function (err, webserver) {
  if (err) return console.log(err)
  controller.createWebhookEndpoints(webserver, bot, function () {
    console.log('Ready Player 1')
  })
})

PHAccessToken = "?access_token=" + PHAccessToken





/* *****************************

   GLOBAL FUNCTIONS

***************************** */


var httpGet = function(url, callback) {
    https.get(url, function(res) {

        var body = '';

        res.on('data', function(data) {
            data = data.toString();
            body += data;
        });

        res.on('end', function() {
            body = JSON.parse(body);
            var stories = body;
            callback(stories);
        });

    }).on('error', function(err) {
        callback(null, err)
    });
}




/* *****************************

    CHOOSE CATEGORY

***************************** */

var chooseCategoryPrompt = function(bot, message) {

    var reply = "Choose a category...";

    bot.reply(message, reply, function(err, response) {

        var categories = [
            {
                "title": "Tech",
                "buttons":[
                    {
                        "type":"postback",
                        "payload": "getPosts_tech",
                        "title":"Today's Hunts"
                    },
                    {
                        "type":"postback",
                        "payload": "getPosts_tech_1",
                        "title":"Yesterday's Hunts"
                    }
                ]
            },
            {
                "title": "Games",
                "buttons":[
                    {
                        "type":"postback",
                        "payload": "getPosts_games",
                        "title":"Today's Hunts"
                    },
                    {
                        "type":"postback",
                        "payload": "getPosts_games_1",
                        "title":"Yesterday's Hunts"
                    }
                ]
            },
            {
                "title": "Podcasts",
                "buttons":[
                    {
                        "type":"postback",
                        "payload": "getPosts_podcasts",
                        "title":"Today's Hunts"
                    },
                    {
                        "type":"postback",
                        "payload": "getPosts_podcasts_1",
                        "title":"Yesterday's Hunts"
                    }
                ]
            },
            {
                "title": "Books",
                "buttons":[
                    {
                        "type":"postback",
                        "payload": "getPosts_books",
                        "title":"Today's Hunts"
                    },
                    {
                        "type":"postback",
                        "payload": "getPosts_books_1",
                        "title":"Yesterday's Hunts"
                    }
                ]
            }
        ]

        bot.reply(message, {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: categories
              }
            }
        })

    })

}







/* *****************************

    POSTS

***************************** */


var setupPostAttachment = function(post) {

    var postAttachment = {
        "title": post.name,
        "image_url": post.thumbnail.image_url,
        "subtitle": post.tagline,
        "buttons":[
          {
            "type":"postback",
            "payload": "postInfo_"+post.id,
            "title":"More Info"
          },
          {
            "type":"web_url",
            "url": post.redirect_url,
            "title":"Hunt This"
          },
          {
            "type":"web_url",
            "url": post.discussion_url,
            "title":"Discuss/Upvote"
          }         
        ]
    }
    
    return postAttachment;

}



function getHunts(bot, message, url) {

    var category = url.split("/categories/");
        category = category[1].split("/posts")[0];

    bot.reply(message, "Fetching hunts in the " +category+ " category..");

    httpGet(url, function(response) {

        var hunts = response.posts;

        var elements = [];

        for ( var i = 0; i < 9; i++ ) {

            if ( hunts[i] ) {
                var post = setupPostAttachment( hunts[i] );
                elements.push(post);
            } else {
                break;
            }
            
        }
        
        bot.reply(message, {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: elements
              }
            }
        })

    })

}





/* *****************************

    Single Post Information

***************************** */


var sendPostInfo_intro = function(bot, message, post) {
    return new Promise(function(resolve, reject) {

        var reply = 'Some more information about "'+post.name+'"';

        bot.reply(message, reply, function(err, response) {
            if (err) reject(err)
            resolve()
        })

    }) 
}


var sendPostInfo_votes = function(bot, message, post, callback) {

    var reaction = "! 🙃";

    var reply = "It has "+post.votes_count+" votes" + reaction;

    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
        callback(true)
    })
}


var sendPostInfo_makerInfo = function(bot, message, post, callback) {
    var number_of_makers = post.makers.length;

    var replyNOM = "There was 1 maker identified, here's some more information on them"
    if ( number_of_makers > 1 ) {
        replyNOM = "There were "+ number_of_makers +" makers identified. Here's some more information on them"
    }

    bot.reply(message, replyNOM);

    var makersProfiles = [];

    for ( var i = 0; i < number_of_makers; i++ ) {
        var maker = post.makers[i];
        var makerAttachment = {
            "title": maker.name,
            "image_url": maker.image_url.original ? maker.image_url.original : "",
            "subtitle": maker.headline ? maker.headline : "",
            "buttons": [
              {
                "type":"web_url",
                "url": maker.profile_url,
                "title":"Visit Profile"
              }        
            ]
        }
        makersProfiles.push(makerAttachment)
    }

    var reply = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: makersProfiles

          }
        }
    }

    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
        callback(true)
    });
}


var sendPostInfo_makerMessage = function(bot, message, post, callback) {

    var number_of_comments = post.comments.length;

    if ( number_of_comments > 0 ) {

        var makerMessage = false;

        for ( var i = 0; i < number_of_comments; i++ ) {
            if ( post.comments[i].maker == true ) {
                makerMessage = post.comments[i];
            }
            if ( makerMessage ) { break; }
        }

        if ( makerMessage ) {

            var messageFrom = makerMessage.user.name;
            var messageBody = makerMessage.body;

            var reply = 'From '+ messageFrom +' — "' + messageBody + '"';

            reply = reply.slice(0, 310) + "...";


            bot.reply(message, reply, function(err, response) {
                if (err) console.log(err)
                callback(true)
            });

        } else { callback(true) }
    } else { callback(true) }
}


var sendPostInfo_media = function(bot, message, post, callback) {
   var number_of_media = post.media.length;
    if ( number_of_media > 0 ) {


        var mediaAttachments = [];

        for ( var i = 0; i < number_of_media; i++ ) {
            var mediaItem = post.media[i];
            if ( mediaItem.media_type == "image" ) {
                mediaAttachments.push({
                    "title": "Media",
                    "image_url": mediaItem.image_url
                })
            }
        }

        if ( mediaAttachments.length > 1 ) {

            bot.reply(message, "Here are some related images...", function(err, response) {

                var reply = {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'generic',
                        elements: mediaAttachments
                      }
                    }
                }
                bot.reply(message, reply, function(err, response) {
                    if (err) console.log(err)
                    callback(true)
                });
            })

        } else { callback(true) }
    } else { callback(true) }
}



var sendPostInfo_CTA = function(bot, message, post) {

    var reply = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: post.name,
                buttons: [
                    {
                        "type":"web_url",
                        "url": post.redirect_url,
                        "title":"Hunt This"
                    },
                    {
                        "type":"web_url",
                        "url": post.discussion_url,
                        "title":"Discuss/Upvote"
                    }  
                ]
            }
        }
    }

    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
    })
}




function getPostInfo(bot, message, postID) {

    var url = "https://api.producthunt.com/v1/posts/"+postID+PHAccessToken;

    httpGet(url, function(response) {

        var post = response.post;

        // Introduction
        sendPostInfo_intro(bot, message, post)
            .then(function() {

                // Number of Votes
                sendPostInfo_votes(bot, message, post, function(response) {

                    // Maker
                    if ( post.makers.length > 0 ) {

                        // Maker - Information
                        sendPostInfo_makerInfo(bot, message, post, function(response) {
                            
                            // Maker - Message
                            sendPostInfo_makerMessage(bot, message, post, function(response) {

                                // Media
                                sendPostInfo_media(bot, message, post, function(response) {

                                    sendPostInfo_CTA(bot, message, post);

                                })

                            })
                        })

                    } else {

                        bot.reply(message, "Looks like none of the makers have been identified yet", function(err, response) {
                            if (err) console.log(err)

                            // Media
                            sendPostInfo_media(bot, message, post, function(response) {

                                sendPostInfo_CTA(bot, message, post);

                            })
                        });
                    }

                })


            }) // END!
            .catch(function(err) {
                console.log("Error", err);
            })

    }) // End http get
}





/* *****************************

    HELP

***************************** */


var help_init = function(bot, message) {

    var reply = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
                {
                    "title": "Messenger Hunt",
                    "subtitle": "Some help using this bot",
                    "image_url": "https://raw.githubusercontent.com/ireade/khaledbot-fb/master/assets/ph-kitten.png",
                    "buttons":[
                        {
                            "type":"postback",
                            "payload": "help_listCommands",
                            "title":"List Commands"
                        },
                        {
                            "type":"postback",
                            "payload": "help_reportError",
                            "title":"Report Error"
                        }
                    ]
                },
                {
                    "title": "Ire Aderinokun",
                    "subtitle": "Maker of Messenger Hunt",
                    "image_url": "https://pbs.twimg.com/profile_images/689743404025122817/zz1j-bC2.png",
                    "buttons":[
                        {
                            "type":"web_url",
                            "url": "http://ireaderinokun.com",
                            "title":"Website"
                        },
                        {
                            "type":"web_url",
                            "url": "https://twitter.com/ireaderinokun",
                            "title":"Twitter"
                        }
                    ]
                },
                {
                    "title": "Product Hunt",
                    "subtitle": "Product Hunt surfaces the best new products, every day.",
                    "image_url": "https://raw.githubusercontent.com/ireade/khaledbot-fb/master/assets/ph-logo.png",
                    "buttons":[
                        {
                            "type":"web_url",
                            "url": "https://www.producthunt.com/",
                            "title":"Website"
                        }
                    ]
                } 

            ]
          }
        }   
    }


    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
    })

}


var help_listCommands = function(bot, message) {

    var reply = "Here are some keywords you can use with me.."
    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)


        bot.reply(message, 'Say "categories" to fetch the list of categories to choose from');

        bot.reply(message, 'Say a category name, for example "tech" to see the latest hunts from that category');

        //bot.reply(message, 'Say "" to ');

    })


}






/* *****************************

    CONTROLLER

***************************** */



/****  KEYWORDS ************************/

controller.hears(['hello', 'hi'], 'message_received', function (bot, message) {
    var reply = "Hi there! I have some hunts for you";
    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
        chooseCategoryPrompt(bot, message);
    });
})

controller.hears(['category', 'categories'], 'message_received', function (bot, message) {
    chooseCategoryPrompt(bot, message);
})

controller.hears(['help'], 'message_received', function (bot, message) {
    var reply = "Looks like you need help";
    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
        help_init(bot, message);
    });
})



controller.hears(['tech', 'technology'], 'message_received', function (bot, message) {
    getHunts(bot, message, "https://api.producthunt.com/v1/categories/tech/posts"+PHAccessToken)
})
controller.hears(['games', 'game'], 'message_received', function (bot, message) {
    getHunts(bot, message, "https://api.producthunt.com/v1/categories/games/posts"+PHAccessToken)
})
controller.hears(['podcasts', 'podcast'], 'message_received', function (bot, message) {
    getHunts(bot, message, "https://api.producthunt.com/v1/categories/podcasts/posts"+PHAccessToken)
})
controller.hears(['books', 'book'], 'message_received', function (bot, message) {
    getHunts(bot, message, "https://api.producthunt.com/v1/categories/books/posts"+PHAccessToken)
})




/****  FACEBOOK POSTBACKS  ************************/

controller.on('facebook_postback', function (bot, message) {

    if ( message.payload.indexOf('postInfo_') > -1 ) {
        var postID = message.payload.split("_")[1];
        getPostInfo(bot, message, postID);
    }

    else if ( message.payload.indexOf('getPosts_') > -1 ) {
        var postCategory = message.payload.split("_")[1];

        var days_ago = message.payload.split("_")[2];
        var days_ago_parameter = "";

        if ( days_ago ) { days_ago_parameter = "&days_ago="+days_ago; }

        getHunts(bot, message, "https://api.producthunt.com/v1/categories/"+postCategory+"/posts"+PHAccessToken+days_ago_parameter)
    }

    else if ( message.payload.indexOf('help_') > -1 ) {
        var helpCommand = message.payload.split("_")[1];

        switch (helpCommand) {
            case 'listCommands':
                help_listCommands(bot, message);
                break  

            case 'reportError':
                var reply = "Email ire@ireaderinokun.com";
                bot.reply(message, reply, function(err, response) {
                    if (err) console.log(err)
                });
                break
        }


        

    }
 

})


/****  OTHER EVENTS  ************************/

controller.on('facebook_optin', function (bot, message) {
    var reply = "Welcome! I have some hunts for you";
    bot.reply(message, reply, function(err, response) {
        if (err) console.log(err)
        chooseCategoryPrompt(bot, message);
    });

})


controller.on('message_received', function (bot, message) {
    bot.reply(message, "Sorry, I didn't get that. Say help if you need some help");

})


