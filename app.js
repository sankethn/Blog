var express = require("express"),
	methodOverride = require("method-override"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	expressSanitizer = require("express-sanitizer"),
	app = express();

mongoose.connect("mongodb://localhost:27017/blog", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res){
	res.redirect("/blog");
})

app.get("/blog", function(req, res){
	Blog.find({}, function(err, blog){
		if(err){
			console.log(err);
		}
		else{
			res.render("index",{blog: blog});
		}
	})
})

app.get("/blog/new", function(req, res){
	res.render("new");
})

app.post("/blog", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}
		else{
			res.redirect("/blog");
		}
	})
})

app.get("/blog/:title", function(req, res){
	Blog.findOne({title: req.params.title}, function(err, foundBlog){
		if(err){
			res.redirect("/blog");
		}
		else{
			res.render("show", {blog: foundBlog});
		}
	})
})

app.get("/blog/:title/edit", function(req, res){
	Blog.findOne({title: req.params.title}, function(err, foundBlog){
		if(err){
			res.redirect("/blog");
		}
		else{
			res.render("edit", {blog: foundBlog});
		}
	})
})

app.put("/blog/:title", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findOneAndUpdate({title: req.params.title}, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blog");
		}
		else{
			res.redirect("/blog/"+req.body.blog.title);
		}
	})
})

app.delete("/blog/:title", function(req, res){
	Blog.findOneAndRemove({title: req.params.title}, function(err){
		if(err){
			res.redirect("/blog");
		}
		else{
			res.redirect("/blog");
		}
	})
})

app.listen(3000, function(){
	console.log("server listening at port 3000");
})