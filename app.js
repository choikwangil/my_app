var express = require("express");
var path = require("path");
var app = express();
var mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB);
// process.env.{{환경변수 명}}

var db = mongoose.connection;

db.once("open", function() {
  console.log("DB Connected!");
});

db.on("error", function(err) {
  console.log("DB Error :", err);
});

var dataSchema = mongoose.Schema({
  name:String,
  count:Number
});

var Data = mongoose.model("data", dataSchema);
Data.findOne({name:"myData"}, function(err, data) {
  if(err) return console.log("Data Error :", err);
  if(!data) {
    Data.create({name:"myData", count:0}, function(err, data) {
      if(err) return console.log("Data Error :", err);
      console.log("Counter initialized :", data);
    });
  }
});

app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));

var data = {count: 0};

app.get("/", function(req, res) {
  Data.findOne({name:"myData"}, function(err, data) {
  if(err) return console.log("Data Error :", err);
  data.count++;
  data.save(function(err) {
    if(err) return console.log("Data Error :", err);
    res.render("my_first_jade", data);
  });
});
});

app.get("/reset", function(req, res) {
  setCounter(res, 0);
});

app.get("/set/count", function(req, res) {
  if(req.query.count) setCounter(res, req.query.count);
  else getCounter(res);
});

app.get("/set/:num", function(req, res) {
  data.count = req.params.num;
  res.render("my_first_jade", data);
});
// app.get("/", function(req, res) {
//   res.send("Hello World!");
// });

function setCounter(res, num) {
  Data.findOne({name:"myData"}, function(err, data) {
    if(err) return console.log("Data Error :", err);
    data.count = num;
    data.save(function(err) {
      if(err) return console.log("Data Error :", err);
      res.render("my_first_jade", data);
    });
  });
}

function getCount(res) {
  Data.findOne({name:"myData"}, function(err, data) {
    if(err) return console.log("Data Error :", err);
    res.render("my_first_jade", data);
  });
}

app.listen(3000, function() {
  console.log("Server On!");
});
