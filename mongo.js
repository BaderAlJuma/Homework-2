const { MongoClient } = require("mongodb");
var express = require('express');
var app = express();
var bodyParser = require("body-parser");
const { redirect } = require("express/lib/response");

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
    "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000";

const client = new MongoClient(uri);

async function findByName(itemName) {
    try {
        await client.connect();
        const database = client.db('FoodDB');
        const foodItems = database.collection('Food_Items');

        const query = { name: itemName };
        const food = await foodItems.findOne(query);

        return food;
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
async function del(itemName) {
    try {
        await client.connect();
        const database = client.db('FoodDB');
        const foodItems = database.collection('Food_Items');

        const query = { name: itemName };
        const food = await foodItems.deleteOne(query);

        
    } finally {
        // Ensures that the client will close when you finish/error
        
    }
}
async function add(itemName, itemPrice) {
    try {
        await client.connect();
        const database = client.db('FoodDB');
        const foodItems = database.collection('Food_Items');

        const query = { name: itemName,
        price: itemPrice };
        const food = await foodItems.insertOne(query);

        
    } finally {
        // Ensures that the client will close when you finish/error
        
    }
}
async function findAll() {
    try {
        await client.connect();
        const database = client.db('FoodDB');
        const foodItems = database.collection('Food_Items');

        const cur = await foodItems.find().project({ _id: 0 });
        const food = cur.toArray();
        return food;
    } finally {
        // Ensures that the client will close when you finish/error

    }
}

async function fetchPassword() {
    try {
        await client.connect();
        const database = client.db('FoodDB');
        const foodItems = database.collection('Admin_Password');

        const food = await foodItems.findOne({}, { projection: { _id: 0 } });

        return food;
    } finally {
        // Ensures that the client will close when you finish/error

        
    }
}

async function updatePassword(newOne) {
    try {
        await client.connect();
        const database = client.db('FoodDB');
        const foodItems = database.collection('Admin_Password');


        const update = { $set: { password: newOne}};
        const options = {};
        foodItems.updateOne({}, update, options);

        
    } finally {
        // Ensures that the client will close when you finish/error

        
    }
}


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

var adminPass = 0;// Placeholder
fetchPassword().then(value => adminPass = value["password"]);

var lastItem = "";
var lastPrice = 0;
var cart = {
    items: [],
    total: 0
};

app.get('/', function (req, res) {
    // res.sendFile(__dirname + '/index.html');
    if(lastPrice!=0){
        res.render("index.ejs", { food: lastItem + " " + lastPrice + "$ ", buyButton: "Add to Cart" });        
    }
    else res.render("index.ejs", { food: "Food Item Unavailable.", buyButton: null });
  

});

app.get('/cart', function (req, res) {
    // res.sendFile(__dirname + '/index.html');
    { res.render("checkout.ejs", { cart }); }

});

app.get('/confirm', function (req, res) {
    var id = Math.random() * 10000000;
    id = Math.trunc(id);
    { res.render("confirm.ejs", { id }); }

});

app.get('/admin', function (req, res) {
    findAll().then(value => {
        var allItems = value;
        res.render("admin.ejs", { allItems });
    });
});

app.post('/change', function (req, res) {
    updatePassword(req.body.newPass).catch(console.dir);
    adminPass = req.body.newPass;
    res.redirect('/admin');
});

app.post('/get-food', function (req, res) {
    findByName((req.body.foodName).toLowerCase()).then(value => {
        if (value != null) {
            lastItem = value["name"];
            lastPrice = parseInt(value["price"]) ;
           
        }
         res.redirect("/");
    });
});

app.post('/admin', function (req, res) {
    if (req.body.adminPassword == adminPass) {
        res.redirect("/admin");
    }
    else res.redirect('/');
});

app.post('/add', function (req, res) {
    cart["items"].push(lastItem);
    cart["total"] += lastPrice;
    res.redirect("/");
});

app.post('/rem', function (req, res) {
    del(req.body.rem).then(value => console.log(value));
    res.redirect('/admin');
});

app.post('/rem1', function (req, res) {
    add(req.body.rem1, req.body.rem2).then(value => console.log(value));
    res.redirect('/admin');
});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});