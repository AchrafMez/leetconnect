import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // Using bcryptjs for easier Docker setup
import prisma from '../lib/prisma';

function TrimAuthInput(body: {
    username: string;
    email: string;
    password: string;
    }) {
    return {
        username: body.username.trim(),
        email: body.email.trim(),
        password: body.password,
  };
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = TrimAuthInput(req.body);

        // input Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Check duplicates in Postgres
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email }, // turn both into lowecase (temporarely) to compare :3
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            return res.status(409).json({ 
                error: existingUser.email === email ? 'Email taken' : 'Username taken' 
            });
        }

        // Slow hash + salt
        // 12 rounds is the industry standard for slow hashing security
        const hashedPassword = await bcrypt.hash(password, 12);

        // Save to Database
        const newUser = await prisma.user.create({
            data: {
                // ive decided to store data as it was submitted 
                // but in login i will lowercase the data to compare that way User123@gmail.com is the same as user123@gmail.com
                username, // trim 
                email,     
                password: hashedPassword,
            },
            // Ensure we don't return the password string in the response
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });

        return res.status(201).json({
            message: `Welcome ${newUser.username} 🐱‍👓`,
            user: newUser
        });

    } catch (error) {
        next(error); // Sends error to the shared errorHandler
    }
};