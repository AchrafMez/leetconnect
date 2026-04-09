import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // Using bcryptjs for easier Docker setup
import jwt from "jsonwebtoken";
import prisma from '../lib/prisma';
import fs from "fs";
import { generateAccessToken, generateRefreshToken } from '../lib/token';

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string);

type AuthBody = {
    username?: unknown,
    email?:unknown,
    password?:unknown
}

function TrimAuthInput(body: AuthBody) {
  const username =
    typeof body.username === 'string'
      ? body.username.trim()
      : '';

  const email =
    typeof body.email === 'string'
      ? body.email.trim()
      : '';

  const password =
    typeof body.password === 'string'
      ? body.password
      : '';

  return { username, email, password };
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = TrimAuthInput(req.body);

        // input Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Check duplicates in Postgres
        // turn into lowercase to compare in db
        const normalizedEmail = email.toLowerCase();
        const normalizedUsername = username.toLowerCase();

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: {
                            equals: normalizedEmail,
                            mode: 'insensitive',
                        },
                    },

                    {
                        username: {
                            equals: normalizedUsername,
                            mode: 'insensitive',
                        },
                    },
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({ 
                error: existingUser.email === email ? 'Email taken' : 'Username taken' 
            });
        }

        // Slow hash + salt
        const hashedPassword = await bcrypt.hash(password, 12);

        // // create user and its refresh token and save them both to DB , if prb happens dont save and do nothing 
        const { user, refreshToken } = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    // ive decided to store data as it is submitted 
                    // but in login i will lowercase the data to compare that way User123@gmail.com is the same as user123@gmail.com
                    username,
                    email,     
                    password: hashedPassword,
                },
                // Ensure we don't return the password string in the response
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true,
                    role: true
                }
            });
            // generate refresh token
            const rt = await tx.refreshToken.create({
                data: {
                token: generateRefreshToken(),
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });

            return { user: newUser, refreshToken: rt };
        });

       
        // generate access token
        const accessToken = generateAccessToken({ userId: user.id, role: user.role });
        
        // set HttpOnly cookie for Refresh Token
        res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true, // Prevents XSS
            secure: true,   // Requires HTTPS
            sameSite: 'strict', // Prevents CSRF
            path: '/api/auth/refresh', // Only send to refresh route
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: "Welcome to LeetConnect",
            accessToken,
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (error) {
        next(error); // Sends error to the shared errorHandler
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email , password} = TrimAuthInput(req.body);
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // search for user by email
        const normalizedEmail = email.toLowerCase();
        const user = await prisma.user.findFirst({
            where: {
                email: {
                        equals: normalizedEmail,
                        mode: 'insensitive',
                    }
            },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid username" });
        }

        // check correct password
        if (!user.password) { // need to add that user is using AOuth
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        // generate jwt refresh and access tokens using private key :D
        const accessToken = jwt.sign( { sub: user.id, email: user.email, username: user.username }
            , privateKey, { 
            algorithm: 'RS256', 
            expiresIn: '15m' 
        });

        return res.status(200).json({
            accessToken,
            user: {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            },
        });
        
    } catch (error) {
        next(error); // Sends error to the shared errorHandler
    }
};

// refresh route for generating new access token :3
export const refresh = async(req: Request, res: Response, next: NextFunction) =>{
    
}