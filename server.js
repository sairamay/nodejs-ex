//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

/////////////////////////////////////////////////////////////////////////
//my stuff
const bodyParser = require('body-parser');
const util = require('util');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

var adminuser = "thanos";
var adminpass = "iamgod"
var people = { "doctorwhocomposer": { "forename": "Delia", "surname": "Derbyshire", "events": "spiderman" } };
var events = {
    "spiderman": { "name": "Spider verse viewing", "date": "2019-01-20", "location": "Heaton Park" },
    "loki": { "name": "Loki Premiere", "date": "2019-02-20", "location": "Manchester" },
    "gotg": { "name": "GOTG Cosplay Meet", "date": "2019-03-15", "location": "Urbis" }
};

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
    var exists = false;
    for (var p in events) {
        if (events[p].date == date) {
            exists = true;
            code = p;
        }
    }
    if (exists) {
        res.send('Event details: Name: ' + events[code].name + ', Date: ' + events[code].date + ', Location: ' + events[code].location);
    }
    else {
        res.send("No events schedualed for this day")
    };
})

app.get('/allevents', function (req, res, next) {
    //res.setHeader("content-type", "application/json");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log("Request made for all events");
    var result = '';
    for (var p in events) {
        var line = 'Event Code: ' + p + ', Name: ' + events[p].name + ', Date: ' + events[p].date + ', Location: ' + events[p].location + '\r\n';
        result += line;
    }
    res.send(result);
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
//end of my stuff

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
