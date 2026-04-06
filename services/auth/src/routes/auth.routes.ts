// endpoints (/register, /login)
// load env variables
// require('dotenv').config(); 

// // import {PrismaClient} from '@prisma/client';
// // create express instance
// const express = require('express');
// const bcrypt = require('bcrypt');
// const app = express();
// const PORT = process.env.PORT || 4000;

// // const router = express.router();
// // const prisma = new PrismaClient();

// app.use(express.json());

// const users = [
//     {username: 'Nunu', email: 'nunu@gmail.com', password: 'sakjjdklkajdlkajld'},
//     {username: 'zozo', email: 'zozo@gmail.com', password: 'asdsasddsadadadadadsa'},
// ];


// app.post('/', function(req, res){
//     console.log("req name: ",req.body);
//     res.end();
// });

// app.post('/register', async (req, res) => {
   
//     // extract data
//     const { username, email, password } = req.body;

    
//     // validate data
//     if (!username || !email || !password){
//         return res.status(400).json({ error: 'Missing fields' });
//     }
    
//     // check duplicates
//     const emailTaken    = users.some(u => u.email === email);
//     const usernameTaken = users.some(u => u.username === username);

//     if (emailTaken)    return res.status(409).json({ error: 'Email is already used' });
//     if (usernameTaken) return res.status(409).json({ error: 'Username is already used' });

    
//     // slow hash passwords + salt
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
    
//     // save data
//     users.push({
//         username: username,
//         email: email,
//         password: hashedPassword,
//     });

//     console.log(users);
//     // send response code and message :3
//     return res.status(200).json({message: `Welcome ${username} 🐱‍👓`});
//     // add rate limiting
// });


// // start server on the port
// app.listen(PORT, function (err) {
//     if (err) console.log(err);
//     console.log("Server listening on PORT", PORT);
// });



import { Router } from 'express';
import { register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);

export default router;