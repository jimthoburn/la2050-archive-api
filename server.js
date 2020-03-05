// server.js
// where your node app starts

const stringify = require("csv-stringify");
const fetch = require("node-fetch");

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

function getData(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        resolve(response.json());
      } else {
        console.error(response.status);
        console.error(url);
        resolve(null);
      }
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

const includeColumns = {
  // "published": 1,
  // "organization_id": 1,
  "title": 1
  // "org_type": 1,
  // "org_summary": 1,
  // "tags_indicators": 1,
  // "charity_navigator_url": 1,
  // "organization_website": 1,
  // "twitter": 1,
  // "instagram": 1,
  // "facebook": 1,
  // "ein": 1
}

function doIncludeColumn(name) {
  // return includeColumns[name];
  return (
          name !== "output" &&
          name !== "content" &&
          name !== "id" &&
          name !== "next" &&
          name !== "previous" &&
          name !== "collection" &&
          name !== "excerpt" &&
          name !== "layout" &&
          name !== "path" &&
          name !== "relative_path" &&
          name !== "body_class" &&
          name !== "published" &&
          name !== "slug" &&
          name !== "ext" &&
          name !== "tags" &&
          name !== "draft");
}

function getColumns(records) {

  let uniqueColumnNames = {}
  records.forEach(item => {
    for (let name in item) {
      if (item.hasOwnProperty(name)) {
        uniqueColumnNames[name] = 1
      }
    }
  })

  let columns = []
  for (let name in uniqueColumnNames) {
    if (uniqueColumnNames.hasOwnProperty(name) && doIncludeColumn(name)) {
      columns.push(name)
    }
  }

  return columns;
}

async function sendCSV(request, response) {
  const name = `${request.originalUrl}`.replace(/\//g, "").replace(/.csv$/g, "");
  console.log("name", name);
  const url = `https://archive.la2050.org/api/${name}.json`;
  const records = await getData(url);
 
  const columns = getColumns(records);

  let data = [];
  data.push(columns);

  for (let record of records) {
    let array = [];
    for (let column of columns) {
      let value = record[column];
      if (doIncludeColumn(column)) {
        array.push(value);
      }
    }
    data.push(array);
  }
  console.log(data);

  stringify(data.slice(0, 4), function(err, output){
    // response.setEncoding("utf8");
    response.attachment(`${name}.csv`);
    response.setHeader("Content-Type", "text/csv");
    response.send(output);
  });
}

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.send(`
<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8" />
  <title>CSV Data from the LA2050 Ideas Archive</title>
</head>
<body>
  <h1>CSV Data from the LA2050 Ideas Archive</h1>
  <ul>
    <li><a href="/organizations.csv">Organizations</a></li>
    <li><a href="/2013.csv">2013 Ideas</a></li>
    <li><a href="/2014.csv">2014 Ideas</a></li>
    <li><a href="/2015.csv">2015 Ideas</a></li>
    <li><a href="/2016.csv">2016 Ideas</a></li>
    <li><a href="/2018.csv">2018 Ideas</a></li>
    <li><a href="/2019.csv">2019 Ideas</a></li>
  </ul>
</body>
</html>
`);
});
app.get("/2013.csv", sendCSV);
app.get("/2014.csv", sendCSV);
app.get("/2015.csv", sendCSV);
app.get("/2016.csv", sendCSV);
app.get("/2018.csv", sendCSV);
app.get("/2019.csv", sendCSV);
app.get("/organizations.csv", sendCSV);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
