// App information
var APP_ID = "amzn1.ask.skill.e506ab15-1cd1-4fbc-a79e-62a2fc651f6b";
var APP_NAME = "PizzaMakers";
var cardTitle = 'Welcome to Pizza Makers!!';
var welcomecardTitle = 'Welcome to Pizza Makers!!';
var setupImageSmall = 'https://s3.amazonaws.com/pizzamakers/Pizza_Maker_Black.jpg';
var setupImageLarge = 'https://s3.amazonaws.com/pizzamakers/Pizza_Maker_Black.jpg';

var AWSregion = 'us-east-1';  // us-east-1


 //The AlexaSkill prototype and import of SDK


var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk')

AWS.config.update({
    region: AWSregion
});

//Data
var symbols1 = require('./data.js')

exports.handler = function (event, context, callback) {   //Calling the handler function
    // Create an instance of the PizzaMaker skill.
    var alexa = Alexa.handler(event, context);    //Importing alexa-sdk & setting up an Alexa object
    var dynamodb = new AWS.DynamoDB;
    var params = {
        TableName: "PizzaOrders.v1",
        ReturnConsumedCapacity: "TOTAL",
        Item:{
            "userId": {"S":event.session.sessionId},
            "userName": {"S":event.session.attributes.userName},
            "PizzaType": {"S":event.session.attributes.PizzaType},
            "PizzaSize": {"S":event.session.attributes.PizzaSize},
            "PizzaPrice": {"S":event.session.attributes.PizzaPrice},
            "TimeOrdered": {"S": event.request.timestamp}
        }
    };

    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });
    alexa.registerHandlers(handlers); //Registering handlers
    alexa.execute();  //Execute function from Alexa object to run the skill's logic
};

var global = {};
var global1 = {};
var global2 = {};

var handlers = {  //Setting up the event handlers
  'NewSession': function () {
      var imageObj = {
          smallImageUrl: setupImageSmall,
          largeImageUrl: setupImageLarge
      };
      var speechOutput = 'The place were you get fresh and hot pizza\'s.  But first, I\'d like to get to know you better. Tell me your name by saying: My name is, and then your name.';
      var repromptOutput = 'Tell me your name by saying: My name is, and then your name.';
      this.emit(':tellWithCard', speechOutput, repromptOutput, welcomecardTitle, imageObj);
      this.shouldEndSession = false;
},
  'LaunchRequest': function () {
    this.emit('ask', 'Welcome to Pizza Makers!, What would you like me to order for you?', 'for example you could ask me, I would like to order a cheese pizza or say help for additional instructions.');
  },

  'NameCapture': function () {
    // Get Slot Values
    var USFirstNameSlot = this.event.request.intent.slots.USFirstName.value;

    //Get Name
    var name;
    if (USFirstNameSlot) {
      name = USFirstNameSlot;
    }

    // Save Name in Session Attributes and Ask for Pizza Type
    if (name) {
        this.attributes['userName'] = name;
        var speechOutput = 'Ok thanks,' + '' + '' + name + ',' + 'Tell me what you want me to order for you';
        var repromptSpeech = 'for example you could ask me, I would like to order a cheese pizza.';
        this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle);
    } else {
        this.emit(':ask', 'Sorry, I didn\'t recognise that name!', 'Tell me your name by saying: My name is, and then your name.');
    }
  },


    //Get PizzaType
     "GetPizzaInfo": function () {
       //Get Slot Values
       var prdct= this.event.request.intent.slots.PIZZA_AVAILABILITY.value;

      // Get UserName from Session Attributes
       var userName = this.attributes['userName'];

      //Get PizzaType
       if (!prdct) {
           this.emit(':ask', 'I didn\'t quite get you', 'please provide something from menu');
       }
       else if(!symbols1.pizza_types[prdct]) {
           this.emit(':ask', 'The pizza you are looking is not available' +' ' + 'please choose from menu', 'you could ask me what you have in menu?');
       }

    // Save Pizzatype in Session Attributes and Ask for Pizza Type
       if (prdct) {
        global = prdct;
        this.attributes['PizzaType'] = prdct;
        this.emit(':ask', 'Ok, I will get you a' + ' ' + ' ' + global + ',' + 'Tell me what size you are looking for', 'for example you tell me I want a small pizza.');
        }
       else {
        this.emit(':ask', 'Sorry, I don\'t have that in menu!', 'You could ask me what is the menu?');
        }
    },


    "GetAllPizzas": function () {
     var prdct1 = this.event.request.intent.slots.PIZZA_MENU;
        for (var product in Object.keys(symbols1.pizza_types)) {
            var speechOutput = 'The pizza\'s available in the menu are' + ' ' + Object.keys(symbols1.pizza_types);
            var repromptSpeech = 'for example you could ask me, I want to order a cheese pizza?'
            this.emit(':ask', speechOutput, repromptSpeech);
        }

    },

    //Get pizzaSize
    "GetPizzasSize": function () {
    //Get Slot Values
        var prdct2 = this.event.request.intent.slots.PIZZAS_SIZE.value;

    // Get UserName from Session Attributes
        var userName = this.attributes['userName'];
        var PizzaType = this.attributes['PizzaType'];

    //Get PizzaSize
        if (!prdct2) {
            this.emit(':ask', 'I didn\'t quite get you', 'please provide what pizza size you are looking for?');
        }
        else if (!Object.keys(symbols1.pizza_types[global])) {
            this.emit(':ask', 'The pizza size you are looking is not available', 'we only serve small medium and large','please choose from it');
        }

    // Save PizzaSize in Session Attributes and Ask for anything else
        if (prdct2) {
            global1 = prdct2;
            this.attributes['PizzaSize'] = prdct2;
            this.emit(':askWithCard', 'yeah sure, your' + '' + global1 + '' + global +'will be ready in 20 minutes, you could ask for the order\'s price saying that: What is the price of order, or ask for anything else', 'you could ask for the order\'s price saying that: What is the price of order, or ask for anything else?');
        }
    },


    //Get Pizzaprice
    "GetPizzasPrice": function () {
        //Get Slot Values
        var prdct4 = symbols1.pizza_types[global][global1];

        //Get UserName, PizzaType, and PizzaSize Session Attributes
        var userName = this.attributes['userName'];
        var PizzaType = this.attributes['PizzaType'];
        var PizzaSize = this.attributes['PizzaSize'];

        //Get PizzaPrice
        if (!prdct4) {
            this.emit(':ask', 'Sorry, we don\'t serve the pizza you are looking for', 'you could ask me for the menu');
        }
        else if (!symbols1.pizza_types[global][global1]) {
            this.emit(':ask', 'The pizza price you are looking is not available, please ask for the price of the pizza you ordered', 'for example you could ask what is the price of cheesepizza?');
        }


        else {
            if (prdct4) {
                global2 = prdct4;
                this.attributes['PizzaPrice'] = prdct4;
            }
            this.emit(':ask', 'The price of your order is' + global2 +'' + 'Thanks and happy pizza!', 'Are you looking for anything else?');
        }

    },


    "AMAZON.HelpIntent": function () {
       this.emit(':ask', 'I can help you in placing an order', 'What do you want me to order for you?, you could also ask me for menu?');
    },

    "AMAZON.StopIntent": function () {
      this.shouldEndSession = true;
      this.emit(':tell', 'Bye. Thanks for visiting Pizzamakers');
      this.emit(':saveState', true);

    },

    "AMAZON.CancelIntent": function () {
      this.shouldEndSession = true;
      this.emit(':tell', 'Bye. Thanks for visiting Pizzamakers.');
      this.emit(':saveState', true);

    },

    "SessionEndedRequest": function () {
        //Force State When User Times Out
        this.emit(':saveState', true);
    }

};



