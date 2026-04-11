import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // Using bcryptjs for easier Docker setup
import jwt from "jsonwebtoken";
import prisma from '../lib/prisma';
import fs from "fs";
import { generateAccessToken, generateRefreshToken } from '../lib/token';
import { ROLES, Role ,publishEvent, AUTH_EVENTS} from '@leetconnect/shared'; // !! use shared constants hal3aar

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH as string);

type AuthBody = {
    username?: unknown,
    email?:unknown,
    password?:unknown,
    role?: unknown;
}

function TrimAuthInput(body: AuthBody) {
    const username = typeof body.username === 'string' ? body.username.trim() : '';

    const email = typeof body.email === 'string' ? body.email.trim() : '';

    const password = typeof body.password === 'string' ? body.password : '';

    const role = typeof body.role === 'string' ? body.role.toUpperCase() : '';

    return { username, email, password, role};
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password, role } = TrimAuthInput(req.body);

        // input Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        if (role !== 'CLIENT' && role !== 'FREELANCER') {
            return res.status(400).json({ error: 'Invalid role selection' });
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
                error: existingUser.email.toLowerCase() === email.toLowerCase() ? 'Email taken' : 'Username taken' 
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
                    role: role as any, // client of freelancer
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

        // shout out hal3ar waaa to other services l user tcreayaaaa waaaa 
        await publishEvent(AUTH_EVENTS.USER_REGISTERED, {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        });

        res.status(201).json({
            message: `Welcome to LeetConnect ${username} !`,
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
            return res.status(401).json({ error: "Invalid email or password" }); // prevents hackers from fishing for emails to see who has an account on the website
        }

        // check correct password
        if (!user.password) { // user might not have password if he using Aouth
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // generate jwt refresh and access tokens using private key :D
        const refreshToken = await prisma.refreshToken.create({
            data: {
                token: generateRefreshToken(),
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
        });

        const accessToken = generateAccessToken({ userId: user.id, role: user.role });

         res.cookie('refreshToken', refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/api/auth/refresh', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: `Welcome Back ${user.username} !`,
            accessToken,
            user: { id: user.id, email: user.email, username: user.username, role: user.role }
        });

    } catch (error) {
        next(error); // Sends error to the shared errorHandler
    }
};

// refresh route for generating new access token when it expires :3
// => allows the user to stay logged in without the needs 
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken: tokenFromCookie } = req.cookies;

        if (!tokenFromCookie) {
            return res.status(401).json({ error: "Refresh token missing" });
        }

        // Look for the token in DB and include the user
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: tokenFromCookie },
            include: { user: true } // get user info
        });

        // Security Checks => does token exist in db? | is the user session canceled? | did the refresh token expire?
        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            return res.status(401).json({ error: "Invalid or expired session" });
        }

        // Generate a fresh Access Token
        const newAccessToken = generateAccessToken({ 
            userId: storedToken.user.id, 
            role: storedToken.user.role 
        });

        return res.json({ accessToken: newAccessToken });

    } catch (error) {
        next(error);
    }
};


// logout => delete refreshToken from db and from httpOnly cookie
export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.sendStatus(204);
};
