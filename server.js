"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const util = require('util');
var cors = require('cors');
//?
const path = require("path");
var http = require("http");
var fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cors());

//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('public'));

//let indexPath = path.join(__dirname, "/Marvel.html");
//var index = fs.readFileSync(indexPath, "utf-8");

//let adminPath = path.join(__dirname, "/admin.html");
//var admin = fs.readFileSync(adminPath, "utf-8");

//let loginPath = path.join(__dirname, "/login.html");
//var login = fs.readFileSync(loginPath, "utf-8");

//let signupPath = path.join(__dirname, "/signup.html");
//var signup = fs.readFileSync(signupPath, "utf-8");

var adminuser = "thanos";
var adminpass = "iamgod"
var people = { "doctorwhocomposer": { "forename": "Delia", "surname": "Derbyshire", "events": "spiderman" } };
var events = {
    "spiderman": { "name": "Spider verse viewing", "date": "2019-01-20", "location": "Heaton Park" },
    "loki": { "name": "Loki Premiere", "date": "2019-02-20", "location": "Manchester" },
    "gotg": { "name": "GOTG Cosplay Meet", "date": "2019-03-15", "location": "Urbis" }
};

//app.get('/', (req, res) => {
//    res.status(200).send('Hello World!')
//})

app.get('/person', function (req, res) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("Request made for people")
    const user = req.query.username;
    res.send('User details: Name: ' + people[user].forename + ' ' + people[user].surname + ', Events: ' + people[user].events);
})

app.get('/allpeople', function (req, res) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("Request made for all people")
    //resp.send('All users: ' + Object.entries(people));
    res.send(util.inspect(people, { showHidden: false, depth: null }))
})

app.get('/people', function (req, res) {
    res.send(people);
})

app.get('/people/:username', function (req, res) {
    //res.send(people.filter(p => (p.username === username)));
    res.send(people[req.params.username])
})

//app.use(function (req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
//});
app.post('/newperson', function (req, res) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    const p = req.body.username; 
    console.log("New person request")
    if (!(p in people)) {
        people[p] = {
            forename: req.body.forename,
            surname: req.body.surname,
            events: req.body.event,
        };
        console.log(people[p]);
        res.send("request for new person called " + req.body.username);
    }
    else {
        res.send("Username already taken. Please choose another");
    }

})

app.post('/people', function (req, res) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("New person request " + JSON.stringify(req.headers));
    var p = req.headers.username;

    if (p in people) {
        res.status(400);
        res.send("Username already taken. Please choose another");
    }

    else {
        if ((req.headers.access_token) == "concertina") {
            people[p] = {
                forename: req.headers.forename,
                surname: req.headers.surname,
                events: "",
            };
            res.send("successful request for new person with username " + req.headers.username); 
        }
        else {

            res.status(403);
            res.send("Access token incorrect");
        }
    }   
})

app.all('/event', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
});
app.get('/event', function (req, res) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("request made for event");
    const code = req.query.code;
    res.send('Event details: Name: ' + events[code].name + ', Date: ' + events[code].date + ', Location: ' + events[code].location);
})

app.get('/eventdate', function (req, res, next) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("request made for event from date");
    var date = req.query.date;
    var result = {};
    var exists = false;
    for (var p in events) {
        if (events[p].date == date) {
            exists = true;
            result[p] = {
                name: events[p].name,
                date: events[p].date,
                location: events[p].location,
            };
        }   
    }
    if (exists) {
        res.send(util.inspect(result, { showHidden: false, depth: null }));
    }
    else {
        res.send("No events schedualed for this day")
    };
})

app.get('/allevents', function (req, res, next) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("Request made for all events")
    res.send(util.inspect(events, { showHidden: false, depth: null }))
})

app.post('/newevent', function (req, res, next) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    const p = req.body.code; 
    console.log("New event request")
    if (!(p in events)) {
        events[p] = {
            name: req.body.name,
            date: req.body.date,
            location: req.body.location,
        };
        console.log(events[p]);
        res.send("request for new event called " + req.body.code);
    }
    else {
        res.send("This event code is already in use, please choose another")
    };
})


//Authentication
app.get('/login', function (req, res, next) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    const user = req.query.username;
    const psswd = req.query.password; //add password to people or make admin var
    //console.log(user + " & " + psswd)
    if ((user == adminuser) && (psswd == adminpass)) {
        //success
        res.send("success");
        //res.sendFile(path.join(__dirname + '/admin.html'));
    }
    else {
        res.send("Username or password incorrent");
    }
})

//app.listen(8090);
module.exports = app
