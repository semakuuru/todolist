//jshint esversion:6
// Mongodb access sema 1234

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash"); // capitalize

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sema:1234@cluster0.c4rohfw.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name: "Welcome add your tasks here"});

const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

const day = date.getDate();


app.get("/", function(req, res) {

  Item.find({}, function(err, item){
    if(err){
      console.log(err);
  } else {
      if (item.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
        });
        res.redirect("/");
      } else {
        console.log("These are the items main page: ", item);
        res.render("list", {listTitle: day, newListItems: item});
      }
    }
});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({name: itemName});

  if (listName === day){
    newItem.save();
    setTimeout(() => {
      res.redirect("/");
    }, 100);

  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      setTimeout(() => {   // Set timeout is an built-in function for implementing delays
        res.redirect("/" + listName);
      }, 100);

    });
  }
});


app.post("/delete", function(req, res){
  const checkedBoxId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === day){
    Item.findByIdAndRemove(checkedBoxId, function(err){
      if(err){
        console.log(err)
      }
    });
    res.redirect("/");
  } else{  // remove or update an element in a property (array) of an object
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedBoxId}}}, function(err, updatedList){
      if(!err){res.redirect("/" + listName);}
    });
  }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  console.log("This is the list name ", customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        console.log("Is this being called");
        list.save();
        res.redirect("/" + customListName);
      } else {
        console.log("These are the items: ", foundList.items);
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
