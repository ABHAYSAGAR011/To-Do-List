//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-abhay:Abhay%401234@cluster0.2xaidya.mongodb.net/todoListDB",
{useNewUrlParser:true}).then(()=>
console.log("Connection Sucessful")
).catch((err) =>{
  console.log(err)
})

const itemsSchema ={
  name: String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList"
});

const item2 = new Item({
  name:"Hit the + button to add a new item"
})

const item3 = new Item({
  name:"<-- Hit this to delete an item"
})
 const defaultItems = [item1 ,item2,item3];

 const listSchema = {
  name: String,
  items: [itemsSchema]
 }


 const List = mongoose.model("List",listSchema)

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


app.get("/", function(req, res) {
 Item.find({},function(err , foundItems){
  if(foundItems.length == 0){
    Item.insertMany(defaultItems,(err) =>{
      if(err){
        console.log(err);
      }else{
         console.log("Sucessfully :)");
      }
    })
    res.redirect("/")
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  console.log(foundItems)
  } 
 })
});

app.get("/:customListName" ,function(req,res){
  const ListName =_.capitalize(req.params.customListName)

  List.findOne({name: ListName} ,function(err , foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: ListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+ ListName)
      }
    else{
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
    });
  }
  }
})
 
});

app.post("/", function(req, res){

 const itemName = req.body.newItem;
 const listName = req.body.list;

 const item = new Item({
  name: itemName
 })
 if(listName === "Today"){
 item.save();
  res.redirect("/")
 }
 else{

  List.findOne({name: listName},function(err,foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect('/'+ listName)
  })
 }
});

app.post("/delete",function(req,res){
   const checkedId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today"){
    Item.findByIdAndRemove(checkedId ,function(err){
      if(!err){
        console.log("Sucessfully deleteS");
        res.redirect("/")
      }
    
   })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedId}}},function(err){
      if(! err){
        res.redirect('/' + listName)
      }
    });
  
  }

})

 
app.get("/about", function(req, res){
  res.render("about");
});
app.post("/click",function(req ,res){
  res.redirect("/")
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
