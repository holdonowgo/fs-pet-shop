'use strict';

let fs = require('fs');
let fsp = require('fs-promise');
let path = require('path');
let petsPath = path.join(__dirname, 'pets.json');

let express = require('express');
let app = express();
let port = process.env.PORT || 8000;
let bodyParser = require('body-parser');

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(function (req, res, next) {
//   res.status(404).send("Not Found")
// })

app.get('/', function(req, res) {
    res.set('Content-Type', 'text/plain');
    res.status(404).send("Not Found");
});

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

app.get('/pets', function(req, res) {
    fs.readFile(petsPath, 'utf8', function(err, petsJSON) {
        if (err) {
            console.error(err.stack);
            return res.sendStatus(500);
        }

        let pets = JSON.parse(petsJSON);

        res.set('Content-Type', 'application/json');
        res.send(pets);
    });
});

app.get('/pets/:id', function(req, res) {
    fs.readFile(petsPath, 'utf8', function(err, petsJSON) {
        if (err) {
            console.error(err.stack);
            return res.sendStatus(500);
        }

        let id = Number.parseInt(req.params.id);
        let pets = JSON.parse(petsJSON);

        if (id < 0 || id >= pets.length || Number.isNaN(id)) {
            res.set('Content-Type', 'text/plain');
            return res.sendStatus(404);
        }

        res.set('Content-Type', 'application/json');
        res.send(pets[id]);
    });
});

app.post('/pets', function(req, res) {

    let age = Number.parseInt(req.body.age);
    let kind = req.body.kind;
    let name = req.body.name;

    if (!age || !kind || !name) {
        res.set('Content-Type', 'text/plain');
        res.body = 'Bad Request';
        res.sendStatus(400);
    }
    // let petJSON = res.json(req.body);

    fsp.readFile(petsPath, {
            encoding: 'utf8'
        })
        .then(function(text) {
            return JSON.parse(text);
        })
        .then(function(arr) {
            let new_pet = {
                age: parseInt(age, 10),
                kind: kind,
                name: name
            };
            arr.push(new_pet);

            // console.log(new_pet);
            // return JSON.stringify(arr);
            fsp.writeFile(petsPath, JSON.stringify(arr))
                .then(function() {
                    res.set('Content-Type', 'application/json');
                    res.send(new_pet);
                });
        })
        // .then(function(jsonStr) {
        //     fsp.writeFile(petsPath, jsonStr);
        // })
        .catch(function(err) {
            console.error(err.stack);
            return res.sendStatus(500);
        });
});
// });

app.use(function(req, res) {
    res.sendStatus(404);
});

app.listen(port, function() {
    console.log('Listening on port', port);
});

module.exports = app;
