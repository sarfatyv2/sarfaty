const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('/Users/natsuooki/Documents/Sarfaty/docs/Integraçao VADU/Manual de API - 3.6.pdf');

pdf(dataBuffer).then(function(data) {
    const text = data.text;
    const index = text.indexOf('JSONGerarReport');
    if (index !== -1) {
        console.log(text.substring(Math.max(0, index - 500), index + 1500));
    } else {
        console.log("Not found");
    }
}).catch(err => {
    console.error(err);
});
