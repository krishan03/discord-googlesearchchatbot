const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const googleIt = require('google-it');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:P@ssw0rd@discordbot-gxec1.mongodb.net/test?retryWrites=true&w=majority";




client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

    if (msg.content === 'hi') {
        msg.reply('Hey');
    }
    else if (msg.content.substring(0, 7) == '!google') {
        var query = msg.content.substring(7).trim();
        msg.reply('Please wait.. Google search is working..');
        //console.log(query);
        googleIt({ 'query': query, 'limit': 5 }).then(results => {
            results.forEach(element => {
                msg.reply(decodeURIComponent(decodeURIComponent(element.link)));
            });
        }).catch(e => {
            //console.log(e);
            msg.reply('Please try again after sometime');
        });
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
    else if (msg.content.substring(0, 7) == '!recent') {
        var args = msg.content.substring(1).split(' ');
        var query = args[1];
        if (query == 'game') {
            const mongoClient = new MongoClient(uri, { useNewUrlParser: true });
            mongoClient.connect(err => {
                const collection = mongoClient.db("bot").collection("history");
                // perform actions on the collection object
                collection.findOne({ '_id': '5dd25adc7dfd7e37c0cf3b02' },
                    function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (result.history.length == 0) {
                                msg.reply("no search history, please searh first");
                            }
                            else if (result.history.length == 1) {
                                msg.reply(result.history);
                            }
                            else {
                                msg.reply(result.history.splice(-2));
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


