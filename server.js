var Botkit = require('botkit')

var accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
var verifyToken = process.env.FACEBOOK_VERIFY_TOKEN
var port = process.env.PORT || 3000

if (!accessToken) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is required but missing')
if (!verifyToken) throw new Error('FACEBOOK_VERIFY_TOKEN is required but missing')
if (!port) throw new Error('PORT is required but missing')

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








// Major Keys from http://khaledipsum.com/
var majorKeys = [
  "Bless up.",
  "They don't want us to win.",
  "We the best.",
  "They don't want us to eat.",
  "Egg whites, turkey sausage, wheat toast, water. Of course they don't want us to eat our breakfast, so we are going to enjoy our breakfast.",
  "Celebrate success right, the only way, apple.",
  "You smart, you loyal, you a genius.",
  "Hammock talk come soon.",
  "Give thanks to the most high.",
  "Congratulations, you played yourself.",
  "Don't ever play yourself.",
  "The key to more success is to have a lot of pillows.",
  "The ladies always say Khaled you smell good, I use no cologne. Cocoa butter is the key.",
  "Watch your back, but more importantly when you get out the shower, dry your back, it's a cold world out there.",
  "It's on you how you want to live your life. Everyone has a choice. I pick my choice, squeaky clean.",
  "How's business? Boomin.",
  "They never said winning was easy. Some people can't handle success, I can.",
  "They will try to close the door on you, just open it.",
  "We don't see them, we will never see them.",
  "Every chance I get, I water the plants, Lion!",
  "In life there will be road blocks but we will over come it.",
  "To succeed you must believe. When you believe, you will succeed.",
  "Life is what you make it, so let's make it.",
  "To be successful you've got to work hard, to make history, simple, you've got to make it.",
  "A major key, never panic. Don't panic, when it gets crazy and rough, don't panic, stay calm.",
  "Put it this way, it took me twenty five years to get these plants, twenty five years of blood sweat and tears, and I'm never giving up, I'm just getting started.",
  "You see that bamboo behind me though, you see that bamboo? Ain't nothin' like bamboo. Bless up.",
  "In life you have to take the trash out, if you have trash in your life, take it out, throw it away, get rid of it, major key.",
  "Surround yourself with angels, positive energy, beautiful people, beautiful souls, clean heart, angel.",
  "Find peace, life is like a water fall, you've gotta flow.",
  "Let's see what Chef Dee got that they don't want us to eat.",
  "Lion!",
  "Surround yourself with angels.",
  "Major key, don't fall for the trap, stay focused. It's the ones closest to you that want to see you fail.",
  "The key to more success is to get a massage once a week, very important, major key, cloth talk.",
  "The key to success is to keep your head above the water, never give up.",
  "It's important to use cocoa butter. It's the key to more success, why not live smooth? Why live rough?",
  "They key is to have every key, the key to open every door.",
  "Learning is cool, but knowing is better, and I know the key to success.",
  "You do know, you do know that they don't want you to have lunch. I'm keeping it real with you, so what you going do is have lunch.",
  "Stay focused.",
  "I told you all this before, when you have a swimming pool, do not use chlorine, use salt water, the healing, salt water is the healing.",
  "You should never complain, complaining is a weak emotion, you got life, we breathing, we blessed.",
  "The key is to enjoy life, because they don't want you to enjoy life. I promise you, they don't want you to jetski, they don't want you to smile.",
  "The other day the grass was brown, now it's green because I ain't give up. Never surrender.",
  "The key is to drink coconut, fresh coconut, trust me.",
  "The weather is amazing, walk with me through the pathway of more success. Take this journey with me, Lion!",
  "You see the hedges, how I got it shaped up? It's important to shape up your hedges, it's like getting a haircut, stay fresh.",
  "Let me be clear, you have to make it through the jungle to make it to paradise, that's the key, Lion!",
  "Always remember in the jungle there's a lot of they in there, after you overcome they, you will make it to paradise.",
  "I'm giving you cloth talk, cloth. Special cloth alert, cut from a special cloth.",
  "Look at the sunset, life is amazing, life is beautiful, life is what you make it.",
  "The first of the month is coming, we have to get money, we have no choice. It cost money to eat and they don't want you to eat."
];

var getRandomKey = function() {
  var index = Math.floor(Math.random() * majorKeys.length);
  return majorKeys[index];
}


var replyRandomKey = function(bot, message) {
  var majorKey = getRandomKey();
  bot.reply(message, majorKey);
}







controller.hears(['hello', 'hi'], 'message_received', function (bot, message) {

  replyRandomKey(bot, message);

  // bot.reply(message, {
  //   attachment: {
  //     type: 'template',
  //     payload: {
  //       template_type: 'button',
  //       text: 'Which do you prefer',
  //       buttons: [
  //         {
  //           type: 'postback',
  //           title: 'Cats',
  //           payload: 'show_cat'
  //         },
  //         {
  //           type: 'postback',
  //           title: 'Dogs',
  //           payload: 'show_dog'
  //         }
  //       ]
  //     }
  //   }
  // })
})

// controller.on('facebook_postback', function (bot, message) {
//   switch (message.payload) {
//     case 'show_cat':
//       bot.reply(message, {
//         attachment: {
//           type: 'image',
//           payload: {
//             url: 'https://media.giphy.com/media/5xaOcLT4VhjRfudPcS4/giphy.gif'
//           }
//         }
//       })
//       break
//     case 'show_dog':
//       bot.reply(message, {
//         attachment: {
//           type: 'image',
//           payload: {
//             url: 'https://media.giphy.com/media/3o7ZeL5FH6Ap9jR9Kg/giphy.gif'
//           }
//         }
//       })
//       break
//   }
// })
