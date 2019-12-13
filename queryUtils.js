/*
 * A collection of useful utilities for querying Mongo dumps
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