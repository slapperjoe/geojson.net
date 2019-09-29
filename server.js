const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

let app = express();

if (process.env.NODE_ENV !== "production") {
  require("now-env");
}

const PORT = process.env.PORT || 1234;

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (process.env.NODE_ENV !== "production") {
  const Bundler = require("parcel-bundler");
  const bundler = new Bundler("index.html");
  app.use(bundler.middleware());
} else {
  app.use(express.static("dist"));
}

app.listen(PORT);
console.log(`Listening on ${PORT}`);
