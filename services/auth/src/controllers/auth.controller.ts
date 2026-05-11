import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs'; // Using bcryptjs for easier Docker setup
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken, generateTempToken, verifyTempToken } from '../lib/token';
import { ROLES, Role , JwtPayload, publishEvent, AUTH_EVENTS} from '@leetconnect/shared'; // !! use shared constants hal3aar
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

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
            user: { id: user.id, username: user.username, type: user.type, role: user.role, avatar: user.avatar, firstname: user.firstname, lastname:user.lastname }
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

        // check 2FA 
        if (user.twoFAEnabled) {
            // create temp token for 2fa(NOT the real access token)
            const tempToken = generateTempToken(user.id);
            return res.status(200).json({
                requires2FA: true,
                tempToken,              // frontend uses this to call /2fa/login
            });
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
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                avatar: user.avatar,
                role: user.role,
                type: user.type,
                isOnline: user.isOnline,
                bio: user.bio,
                location: user.location,
                website: user.website,
                title: user.title,
                skills: user.skills,
                rate: user.rate,
                category: user.category,
                expLevel: user.expLevel,
                createdAt: user.createdAt,
                twoFAEnabled: user.twoFAEnabled,
                oauthProvider: user.oauthProvider,
            }
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


export const getAllFreelancers = async (_req: Request, res: Response) => {
  try {
    const freelancers = await prisma.user.findMany({
      where: {
        type: "FREELANCER",
      },
      orderBy: [
        { rating: "desc" },
        { reviewCount: "desc" },
        { createdAt: "desc" }
      ],
    });

    return res.json({success: true,freelancers,});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};


export const getAllClients = async (_req: Request, res: Response) => {
  try {
    const clients = await prisma.user.findMany({
      where: {
        type: "CLIENT",
      },orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({success: true,clients,});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};



export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

  
    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        email: true,
        avatar: true,
        role: true,
        type: true,
        rating: true,
        reviewCount: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error: any) {
    console.error("GET USER BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




// user settings profile method
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = req.user as JwtPayload; 
        const userId = authUser.userId; // From JWT

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
            select: {
                id: true,
                email: true,
                username: true,
                firstname: true,
                lastname: true,
                avatar: true,
                role: true,
                type: true,
                isOnline: true,
                bio: true,
                location: true,
                website: true,
                title: true,
                skills: true,
                rate: true,
                category: true,
                expLevel: true,
                createdAt: true,
                twoFAEnabled: true,
                oauthProvider: true,
            }
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
        const authUser = req.user as JwtPayload; 
        const userId = authUser.userId; // From JWT
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

        // delete all refresh tokens when the user change the pw
        // await prisma.$transaction([
        //     // Update the password
        //     prisma.user.update({
        //         where: { id: userId },
        //         data: { password: hashed }
        //     }),
        //     // Kill EVERY session for this user across all devices
        //     // we use userId, not token
        //     prisma.refreshToken.deleteMany({
        //         where: { userId: userId } 
        //     })
        // ]);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        next(error);
    }
};

// upload avatar picture

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // check ACTUAL magic bytes of the buffer
        // This catches spoofed MIME types (e.g. shell.php sent as image/jpeg)
        const { fileTypeFromBuffer } = await import('file-type');
        
        const detected = await fileTypeFromBuffer(req.file.buffer);
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!detected || !allowedMimes.includes(detected.mime)) {
            return res.status(400).json({ error: 'Invalid file content' });
        }

        const authUser = req.user as JwtPayload; 
        const userId = authUser.userId; // From JWT
        const hash = crypto.randomBytes(8).toString('hex');
        const uploadDir = path.join(process.cwd(), 'uploads/avatars');
        fs.mkdirSync(uploadDir, { recursive: true });
        const filename = `avatar-${userId}-${hash}.webp`;
        const uploadPath = path.join(uploadDir, filename);

        // Get old avatar BEFORE updating
        const existingUser = await prisma.user.findUnique({ 
            where: { id: userId },
            select: { avatar: true }
        });

        //  Sharp re-encode destroys any hidden payloads
        try {
            await sharp(req.file.buffer)
                .resize(250, 250)
                .webp({ quality: 80 })
                .toFile(uploadPath);
        } catch (err){
            // console.error('Sharp error:', err); 
            return res.status(400).json({ error: 'Invalid or corrupted image file' });
        }

        const avatarUrl = `/uploads/avatars/${filename}`;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarUrl },
        });

         // Delete old avatar AFTER successful DB update
        if (existingUser?.avatar && existingUser.avatar.startsWith('/uploads/avatars/')) {
            const oldFilename = path.basename(existingUser.avatar.split('?')[0] as string);
            const oldPath = path.join(uploadDir, oldFilename);
            fs.unlink(oldPath, (err) => {
                if (err) console.warn('Could not delete old avatar:', err.message);
            });
        }

        await publishEvent(AUTH_EVENTS.USER_UPDATED, {
            id: user.id,
            avatar: avatarUrl
        });

        res.json({ message: 'Avatar updated', avatar: avatarUrl });
    } catch (error) {
        next(error);
    }
};

export const SetupProfile = async (req: Request, res: Response) => {
  try {
    const { category, skills, rate, expLevel, title, bio } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const authUser = req.user as JwtPayload;
    const userId = authUser.userId;
    const dataToUpdate: any = {
      category,
      skills,
      expLevel,
      title,
      bio,
    };
    if (rate !== undefined) {
      dataToUpdate.rate = rate ? Number(rate) : null;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: dataToUpdate,
    });

    await publishEvent(AUTH_EVENTS.USER_UPDATED, {
      id: updatedUser.id,
      bio: updatedUser.bio,
    });

    return res.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.log("SETUP ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};