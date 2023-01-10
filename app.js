//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const mongoose=require("mongoose");
const _ = require("lodash");


//DB CONNECTION.
mongoose.set('strictQuery', false);
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolist2DB');
}

const itemsSchema =new mongoose.Schema({
  name:String,

});

const ItemModel =mongoose.model("item", itemsSchema);
const item1 =new ItemModel ({
  name:"washing the car.",

});

const item2 =new ItemModel ({
  name:"feed the dog.",

});

const item3 =new ItemModel ({
  name:"get a dog.",

});

const deafualtItems=[item1,item2, item3];

const listSchema =new mongoose.Schema({
  name:String,
items:[itemsSchema]
});

const ListModel =mongoose.model("list", listSchema);



app.get("/", function(req, res) {

ItemModel.find({},(err,foundItems)=>{

  if (foundItems.length===0) {
    ItemModel.insertMany(deafualtItems, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Items sucessfully added.");
    }

    });
//res.redirect("/");
  } else {

      res.render("list", {listTitle:"Today", newListItems: foundItems});
  }

});



});

app.get("/:customList",(req,res)=>{

  const typedListName =_.capitalize(req.params.customList);


 ListModel.findOne({name:typedListName},function(err,foundList){
   if (!err) {
     if (!foundList) {
       const list= new ListModel({
         name: typedListName,
    items:deafualtItems
       });

       list.save();
       res.redirect("/" + typedListName);

     } else {

       res.render("list", {listTitle:foundList.name,newListItems:foundList.items});
     }
   }
});

});


app.post("/", function(req, res){

  const enteredItem = req.body.newItem;
  const listName=req.body.list; //namn på button för att veta vilken list.

  const newItem =new ItemModel ({
    name:enteredItem
  });

if (listName === "Today") {
    newItem.save();
    res.redirect("/");

} else {
ListModel.findOne({name:listName},(err,foundList)=>{

    foundList.items.push(newItem); //hittar listan, och sätter nya item inne i items som var skapat i itemsSchema.
  foundList.save();
    res.redirect("/"+listName);
    });
   }
});

app.post("/delete",(req, res)=>{

const checkedItemId=req.body.checkbox;
const listName=req.body.listName;

if (listName==="Today") {
  ItemModel.findByIdAndRemove(checkedItemId,(err)=>{
  if (err) {
    console.log(err);
  }else{


      res.redirect("/");
  }

    });

} else {

ListModel.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,fountList)=>{
if(!err){
res.redirect("/" + listName);
}
});
}
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
