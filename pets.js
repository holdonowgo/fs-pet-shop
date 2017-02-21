if (process.argv.length < 3) {
    console.error(
        'Usage: node pets.js [read | create | update | destroy]'
    );
    process.exit(1);
}

var fsp = require('fs-promise');

// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`);
// });

const argument = process.argv[2];

switch (argument) {
    case 'read':
        read_file();
        break;
    case 'create':
        create_pet();
        // fsp.writeFile('pets.json', 'hello world')
        //     .then(function() {
        //         return fsp.readFile('/tmp/hello1.txt', {
        //             encoding: 'utf8'
        //         });
        //     })
        //     .then(function(contents) {});
        break;
    case 'update':
        update_pet();
        break;
    default:
        break;
}

function update_pet() {
    let idx = process.argv[3];
    let age = process.argv[4];
    let kind = process.argv[5];
    let name = process.argv[6];
    if (!idx || !age || !kind || !name) {
        console.error(
            'Usage: node pets.js update INDEX AGE KIND NAME'
        );
        process.exit(1);
    }
    fsp.readFile('pets.json', {
            encoding: 'utf8'
        })
        .then(function(text) {
            return JSON.parse(text);
        })
        .then(function(arr) {
            let pet = arr[idx];
            pet.age = parseInt(age, 10);
            pet.kind = kind;
            pet.name = name;
            console.log(pet);
            return JSON.stringify(arr);
        })
        .then(function(jsonStr) {
            fsp.writeFile('pets.json', jsonStr);
        });
}

function read_file() {
    fsp.readFile('pets.json', {
            encoding: 'utf8'
        })
        .then(function(text) {
            return JSON.parse(text);
        })
        .then(function(arr) {
            const idx = process.argv[3]
            if (idx) {
                let pet = arr[idx];
                if (!pet) {
                    console.error(
                        'Usage: node pets.js INDEX'
                    );
                    process.exit(1);
                } else {
                    console.log(arr[idx]);
                }
            } else {
                console.log(arr);
            }
        });
}

function create_pet() {
    let age = process.argv[3];
    let kind = process.argv[4];
    let name = process.argv[5];
    if (!age || !kind || !name) {
        console.error(
            'Usage: node pets.js create AGE KIND NAME'
        );
        process.exit(1);
    }
    fsp.readFile('pets.json', {
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
            console.log(new_pet);
            return JSON.stringify(arr);
        })
        .then(function(jsonStr) {
            fsp.writeFile('pets.json', jsonStr);
        });
}
