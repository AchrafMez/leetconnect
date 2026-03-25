// load env variables
require('dotenv').config(); 


// create express instance
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

// express.json middleware is applied to parse incoming JSON request bodies, making the data accessible via req.body
app.use(express.json());

const users = [
    {username: 'Nunu', email: 'nunu@gmail.com', password: 'sakjjdklkajdlkajld'},
    {username: 'zozo', email: 'zozo@gmail.com', password: 'asdsasddsadadadadadsa'},
];


app.post('/', function(req, res){
    console.log("req name: ",req.body);
    res.end();
});

app.post('/register', function(req, res){
   
    // extract data
    const { username, email, password } = req.body;

    
    // validate data
    if (!username || !email || !password){
        return res.status(400).json({ error: 'Missing fields' });
    }
    
    // check duplicates
    const emailTaken    = users.some(u => u.email === email);
    const usernameTaken = users.some(u => u.username === username);

    if (emailTaken)    return res.status(409).json({ error: 'Email is already used' });
    if (usernameTaken) return res.status(409).json({ error: 'Username is already used' });

    
    // hash passwords + salt
    
    // save data
    
    // send response code and message :3
    return res.status(200).json({message: `Welcome ${username} 🐱‍👓`});
});


// start server on the port
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});