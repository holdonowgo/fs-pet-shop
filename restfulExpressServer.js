/*jshint esversion: 6 */

'use strict';

const fs = require('fs');
const fsp = require('fs-promise');
const path = require('path');
const petsPath = path.join(__dirname, 'pets.json');

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const morgan = require('morgan');

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

app.get('/pets/:id', (req, res) => {
    fs.readFile(petsPath, 'utf8', (err, petsJSON) => {
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

app.patch('/pets/:id', (req, res) => {

    let age = Number.parseInt(req.body.age);
    let kind = req.body.kind;
    let name = req.body.name;

    if (!age && !kind && !name) {
        res.set('Content-Type', 'text/plain');
        res.body = 'Bad Request';
        res.sendStatus(400);
    } else if (!age) {
        res.set('Content-Type', 'text/plain');
        res.body = 'Bad Request';
        res.sendStatus(400);
    }

    readFile(petsPath)
        .then((pets) => {
            let patch_pet = pets[req.params.id];
            patch_pet.age = age || patch_pet.age;
            if (kind) {
                patch_pet.kind = kind;
            }
            if (name) {
                patch_pet.name = name;
            }

            fsp.writeFile(petsPath, JSON.stringify(pets))
                .then(() => {
                    res.set('Content-Type', 'application/json');
                    res.send(patch_pet);
                });
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
    };

    readFile(petsPath)
        .then((arr) => {
            let new_pet = {
                age: parseInt(age, 10),
                kind: kind,
                name: name
            };
            arr.push(new_pet);

            fsp.writeFile(petsPath, JSON.stringify(arr))
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

app.delete('/pets/:id', (req, res) => {
    let idx = Number.parseInt(req.params.id);

    if (!idx) {
        res.set('Content-Type', 'text/plain');
        res.body = 'Bad Request';
        res.sendStatus(400);
    };

    readFile(petsPath)
        .then((pets) => {
            let pet = pets.splice(idx, 1)[0];

            fsp.writeFile(petsPath, JSON.stringify(pets))
                .then(() => {
                    res.set('Content-Type', 'application/json');
                    res.send(pet);
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


module.exports = app;
