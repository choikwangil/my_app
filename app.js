var express = require("express");
var path = require("path");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverrid = require("method-override");

mongoose.connect("mongodb://admin:admin@ds035485.mongolab.com:35485/myapps");
// process.env.{{환경변수명}} ex) process.env.MONGO_DB
var db = mongoose.connection;

db.once("open", function() {
  console.log("DB Connected!");
});

db.on("error", function(err) {
  console.log("DB Error :", err);
});

// model setting
var postSchema = mongoose.Schema({
  title:{type:String, required:true},
  body:{type:String, required:true},
  createdAt:{type:Date, default:Date.now},
  updateAt:Date
});
var Post = mongoose.model("post", postSchema);

// view setting
app.set("view engine", "jade");

// set middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverrid("_method"));

// set routes
app.get("/", function(req, res) {
  Post.find({}).sort("-createdAt").exec(function(err, posts) {
    if(err) return error(res, err);
    success(res, posts, "posts/index");
  });
}); // index

app.get("/posts", function(req, res) {
  Post.find({}).sort("-createdAt").exec(function(err, posts) {
    if(err) return error(res, err);
    success(res, posts, "posts/index");
  });
}); // index

app.get("/posts/new", function(req, res) {
  res.render("posts/new");
});

app.post("/posts", function(req, res) {
  Post.create(req.body.post, function(err, post) {
    if(err) return error(res, err);
    res.redirect("/posts");
  });
});

app.get("/posts/:id", function(req, res) {
  Post.findById(req.params.id, function(err, post) {
    if(err) return error(res, err);
    success(res, post, "posts/show");
  });
});

app.get("/posts/:id/edit", function(req, res) {
  Post.findById(req.params.id, function(err, post) {
    if(err) return error(res, err);
    success(res, post, "posts/edit");
  });
})

app.put("/posts/:id", function(req, res) {
  req.body.post.updateAt = Date.now();
  console.log(req.body.post);
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
    if(err) return error(res, err);
    res.redirect("/posts/"+req.params.id);
  });
});

app.delete("/posts/:id", function(req, res) {
  Post.findByIdAndRemove(req.params.id, function(err, post) {
    if(err) return error(res, err);
    res.redirect("/posts");
  });
});

// start server
app.listen(3000, function() {
  console.log("Server On!");
});

// definition method
function error(res, data) {
  return res.json({success:false, message:data});
}

function success(res, data, view) {
  res.render(view, {data: data});
}
