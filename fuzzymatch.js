/**
 * To fuzzy match EventBrite data with db of users, b/c they didn't use .edu emails
 * NOTE: won't need if we ask for phone nums in EventBrite which is unique
 * 
 * Written 11/4/2018 by Ben Cooper and Kwuang Tang
 */


const FuzzySet = require('fuzzyset.js');

let arr = require('./iitpurdue.js');

let applied = require('./applied.js');
let match_emails = [];
let match_names = [];

let ufEbrite = arr.map(person => ({
    name: `${person['First Name']} ${person['Last Name']}`.toLowerCase(),
    email: person['Email Address'],
    matched: false,
   }))

ufEbrite.forEach(person => {
    for (let i = 0; i < applied.length; i++) {
        if (person.email.toLowerCase() === applied[i].email.toLowerCase()) {
            match_emails.push(person.email);
            person.matched = true;
        } else {
            //   person.matched = false;
        }
    }
});

const fuzzyAdmittedSet = FuzzySet(applied.map(person => person.name));
ufEbrite.filter(person => !person.matched).forEach(person => {
    let conf = fuzzyAdmittedSet.get(person.name)[0][0];
    if (conf === 1) {
        console.log(person.name)
        match_names.push(fuzzyAdmittedSet.get(person.name)[0][1])
    }
    else
        console.log(person.name, person.email, fuzzyAdmittedSet.get(person.name).filter(e => e[0] > .5));
});

console.log(ufEbrite.length, match_emails, match_names);