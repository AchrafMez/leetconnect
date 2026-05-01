import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // Using bcryptjs for easier Docker setup
import jwt from "jsonwebtoken";
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../lib/token';
import { ROLES, Role ,publishEvent, AUTH_EVENTS} from '@leetconnect/shared'; // !! use shared constants hal3aar
// import { User } from 'lucide-react';

type AuthBody = {
    username?: unknown,
    email?:unknown,
    password?:unknown,
    firstname?: unknown;
    lastname?: unknown;
    type?: unknown; // changed from role
    role?: unknown;
}

function TrimAuthInput(body: AuthBody) {
    const username = typeof body.username === 'string' ? body.username.trim() : '';

    const email = typeof body.email === 'string' ? body.email.trim() : '';

    const password = typeof body.password === 'string' ? body.password : '';

    const type = typeof body.type === 'string' ? body.type.toUpperCase() : '';

    const firstname = typeof body.firstname === 'string' ? body.firstname.trim() : '';

    const lastname = typeof body.lastname === 'string' ? body.lastname.trim() : '';
    
    return { username, email, password, type, firstname, lastname};
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password, type ,firstname, lastname} = TrimAuthInput(req.body);

        // input Validation
        if (!username || !email || !password || !firstname || !lastname) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        
        if (type !== 'CLIENT' && type !== 'FREELANCER') {
            return res.status(400).json({ error: 'Invalid type selection' });
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
                error: existingUser.email.toLowerCase() === email.toLowerCase() ? 'Email is taken' : 'Username is taken' 
            });
        }

        // Slow hash + salt
        const hashedPassword = await bcrypt.hash(password, 12);

        // // create user and its refresh token and save them both to DB , if prb happens dont save and do nothing 
        const { user, refreshToken } = await prisma.$transaction(async (tx: any) => {
            const newUser = await tx.user.create({
                data: {
                    // ive decided to store data as it is submitted 
                    // but in login i will lowercase the data to compare that way User123@gmail.com is the same as user123@gmail.com
                    username,
                    email,     
                    firstname,
                    lastname,
                    password: hashedPassword,
                    type: type as any, // client of freelancer
                    role: 'USER', // default role is user
                },
                // Ensure we don't return the password string in the response
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    createdAt: true,
                    role: true,
                    type: true,
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
        const accessToken = generateAccessToken({ userId: user.id, role: user.role, type: user.type });
        
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
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            type: user.type
        });

        res.status(201).json({
            message: `Welcome to LeetConnect ${username} !`,
            accessToken,
            user: { id: user.id, username: user.username, type: user.type, role: user.role }
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

        const accessToken = generateAccessToken({ userId: user.id, role: user.role, type: user.type });

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
            user: { id: user.id, email: user.email, username: user.username, role: user.role, type: user.type }
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
        const newAccessToken = generateAccessToken({  userId: storedToken.user.id, role: storedToken.user.role , type: storedToken.user.type });

        return res.json({ accessToken: newAccessToken });

    } catch (error) {
        next(error);
    }
};


// logout => delete refreshToken from db and from httpOnly cookie
export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) { // protect the token so deletemany dont wipe out all the db :)
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
        return res.sendStatus(204);
    }
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.sendStatus(204);
};


// user settings profile method
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId; // From JWT
        const allowedFields = ['email', 'firstname', 'lastname', 'username', 'avatar', 'bio', 'location', 'website', 'title'];

        // only include data that was sent in the request
        const data: Record<string, any> = {};
        for (const field of allowedFields) {
            if (field in req.body) {
                data[field] = req.body[field];
            }
        }
        // there is nothing to update if data is empty so nothing changed
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Update in the Auth Database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, username: true, firstname: true, lastname: true, email: true, role: true, type: true, avatar: true, bio:true, title:true, website:true, location:true }
        });

        // Tell other services the profile changed
        await publishEvent(AUTH_EVENTS.USER_UPDATED, {
            id: updatedUser.id,
            ...data
        });

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// change password in profile settings
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        // verify current password
        const isMatch = await bcrypt.compare(currentPassword, user!.password!);
        if (!isMatch) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: [{ field: 'currentPassword', message: 'Current password is incorrect' }]
            });
        }

        if (newPassword === currentPassword) {
            return res.status(400).json({
                error: 'Validation failed',
                details: [{ field: 'newPassword', message: 'New password must be different from current password' }]
            });
        }
        
        // hash and save new password
        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        next(error);
    }
};

