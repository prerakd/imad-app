var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var Pool = require('pg').Pool;

var config = {
    user: 'prerakdholakia',
    database: 'prerakdholakia',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

function hash(input, salt) {
   var  hashed = crypto.pbkdf2Sync(input, salt,10000, 512, 'sha512');
    return hashed.toString('hex');
};

app.get('/hash/:input', function(req, res){
    var hashedString = hash(req.params.input, 'random-string');
    res.send(hashedString);
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.post('/create-user', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)', [username, password], function(err, result){
        if(err){
            res.status(500).send(err.toString());
        } else {
            res.send("user successfully created"+username);
        }
    })
})
app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

var pool = new Pool(config);
app.get('/test-db', function (req, res){
    pool.query('SELECT * from test', function (err, res){
        if(err){
            res.status(500).send(err.toString());
        } else {
            res.send(JSON.stringify(result.rows));
        }
        
    });
    
});

function createTemplate(data){
    var content = data.content
    var htmlTemplate = `<html>
                            <body>
                                ${content}
                            </body>
                        </html>
    `
    return htmlTemplate;
}
app.get('/articles/:articleName', function (req, res){
    var articleName = req.params.articleName;
    pool.query("SELECT * from article WHERE title = '"  + articleName+"'", function(err, result){
        if(err){
            result.status(500).send(err.toString());
        } else {
            if(result.rows.length === 0){
                result.status(404).send("Article not found");
            } else {
                var articleData = result.rows[0];
                res.send(createTemplate(articleData));
            }
                
        }
        
    });
  
});

app.post('/create-user', function(req, response){
    var userName = req.body.username;
    var password = req.body.password;
    var salt = crypto.getRandomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO "user" (userName, password) VALUES $1 $2', [userName, dbString], function(err, result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send('User successfully created', userName);
        }
    })
})




// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
