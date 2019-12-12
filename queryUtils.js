/*
 * A collection of useful utilities for querying Mongo dumps
 * MIT Licensed 2019 by VandyHacks
 *
 * Written 10/24/2019 by Kwuang Tang
 *
 */
const fs = require("fs");

/**
 * Converts a Mongo collection dump to an JS array of documents
 * @param {String} filepath
 */
function convertMongoDumpToArray(filepath) {
  // Get content from file
  let contents = fs.readFileSync(filepath).toString();
  contents = contents.replace("\[,", "[");
  const delim = '{"_id"';
  const arr = contents.split(delim).map(e => delim + e.trim());
  arr.shift(); // remove first elem
  const result = JSON.parse(`{ "data": [${arr.toString()}]}`).data;
  console.log(result.length + " total records in " + filepath);
  return result;
}

/**
 * Writes an array of users to a file
 * @param {[any]} users
 * @param {String} outputFileName
 */
function writeUsersToFile(users, outputFileName) {
  console.log(`Writing ${users.length} users to ${outputFileName}.`);
  const lines = users.map(e => (Array.isArray(e) ? e.join(", ") : e));
  fs.writeFileSync(outputFileName, lines.join("\n"));
}

/**
 * Associates application responses with their user
 * Returns new list of users
 * @param {Array} responses
 * @param {Array} users
 */
function associateResponsesWithUser(responses, users) {
  const usersMap = {};
  users.forEach(u => {
    const UID = u._id["$oid"];
    usersMap[UID] = u;
  });
  console.log("Created users map.");

  let numOrphaned = 0;
  responses.forEach(a => {
    const author = usersMap[a.userId["$oid"]];
    // NOTE: there are some questions that don't belong to anyone if their user was deleted...
    if (author) {
      if (!author.app) author.app = {};
      author.app[a.question] = a.answer;
    } else {
      numOrphaned += 1;
    }
  });
  console.log("Associated users with application questions.");
  console.log(`${numOrphaned} questions orphaned.`);
  return Object.values(usersMap);
}

module.exports = {
  convertMongoDumpToArray,
  writeUsersToFile,
  associateResponsesWithUser
};
