'use strict';
/*jshint esversion: 6 */

// let fs = require('fs');
const fsp = require('fs-promise');
const path = require('path');
const petsPath = path.join(__dirname, 'pets.json');

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');

app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.status(404).send("Not Found");
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Internal Server Error')
})

app.get('/pets', (req, res) => {

    readFile(petsPath)
        .then((pets) => {
            res.set('Content-Type', 'application/json');
            res.send(pets);
        })
        .catch((err) => {
            console.error(err.stack);
            return res.sendStatus(500);
        });
});

app.get('/pets/:idx', (req, res) => {

    readFile(petsPath)
        .then((pets) => {
            let idx = Number.parseInt(req.params.idx);

            if (idx < 0 || idx >= pets.length || Number.isNaN(idx)) {
                res.set('Content-Type', 'text/plain');
                return res.sendStatus(404);
            }

            res.set('Content-Type', 'application/json');
            res.send(pets[idx]);
        })
        .catch((err) => {
            console.error(err.stack);
            return res.sendStatus(500);
        });
});

app.post('/pets', (req, res) => {

    let age = Number.parseInt(req.body.age);
    let kind = req.body.kind;
    let name = req.body.name;

    if (!age || !kind || !name) {
        res.set('Content-Type', 'text/plain');
        res.body = 'Bad Request';
        res.sendStatus(400);
    }

    readFile(petsPath)
        .then((petsArray) => {
            let new_pet = {
                age: parseInt(age, 10),
                kind: kind,
                name: name
            };

            petsArray.push(new_pet);

            fsp.writeFile(petsPath, JSON.stringify(petsArray))
                .then(() => {
                    res.set('Content-Type', 'application/json');
                    res.send(new_pet);
                });
        })
        .catch((err) => {
            console.error(err.stack);
            return res.sendStatus(500);
        });
});

function readFile(petsPath) {

    return fsp.readFile(petsPath, {
            encoding: 'utf8'
        })
        .then((text) => {
            return JSON.parse(text);
        })
        .catch((err) => {
            console.error(err.stack);
        });
};

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => {
    console.log('Listening on port', port);
});

module.exports = app;
