const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const googleIt = require('google-it');
const MongoClient = require('mongodb').MongoClient;

//mongoDB connection string on Atlas
const uri = "mongodb+srv://<username>:<password>@discordbot-gxec1.mongodb.net/test?retryWrites=true&w=majority";


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    //replying to hi
    if (msg.content === 'hi') {
        msg.reply('Hey');
    }
    //replying to !google search
    else if (msg.content.substring(0, 7) == '!google') {
        var query = msg.content.substring(7).trim();
        msg.reply('Please wait.. Google search is working..');
        //calling Google Search API
        googleIt({ 'query': query }).then(results => {
            results.splice(0, 5).forEach(element => {
                msg.reply(element.link);
            });
        }).catch(e => {
            msg.reply('Please try again after sometime');
        });
        //inserting search result in Database in MongoDB atlas
        const mongoClient = new MongoClient(uri, { useNewUrlParser: true });
        mongoClient.connect(err => {
            const collection = mongoClient.db("bot").collection("history");
            collection.findOneAndUpdate({ '_id': '5dd25adc7dfd7e37c0cf3b02' },
                { $push: { history: query } },
                { safe: true, upsert: true },
                function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("inserted");
                    }
                }
            );
            mongoClient.close();
        });

    }
    //hsowing recent search from persistent store i.e., MongoDB
    else if (msg.content.substring(0, 7) == '!recent') {
        var args = msg.content.substring(1).split(' ');
        var query = args[1];
        if (query == 'game') {
            const mongoClient = new MongoClient(uri, { useNewUrlParser: true });
            mongoClient.connect(err => {
                const collection = mongoClient.db("bot").collection("history");
                collection.findOne({ '_id': '5dd25adc7dfd7e37c0cf3b02' },
                    function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (result.history.length == 0) {
                                msg.reply("no search history, please searh first");
                            }
                            else if (result.history.length == 1 || result.history.length == 2) {
                                msg.reply(result.history);
                            }
                            else {
                                msg.reply(result.history.splice(-3));
                            }
                        }
                    }
                );
                mongoClient.close();
            });

        }
        else {
            msg.reply("I am not trained for this, pleasae try again after some time.");
        }
    }



});

client.login(auth.token);


