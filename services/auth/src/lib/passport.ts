import passport from 'passport';
// import { Strategy as FortyTwoStrategy } from 'passport-42';
import prisma from '../lib/prisma';
import { publishEvent, AUTH_EVENTS } from '@leetconnect/shared';
const FortyTwoStrategy = require("passport-42").Strategy;
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

passport.use('42', new FortyTwoStrategy({
    clientID: process.env.INTRA_CLIENT_ID!,
    clientSecret: process.env.INTRA_CLIENT_SECRET!,
    callbackURL: process.env.INTRA_CALLBACK_URL || "https://localhost/api/auth/42/callback",
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {

        const email = profile.emails[0].value;
        if (!email) {
            return done(null, false, { message: 'OAUTH_FAILED' });
        }
        const fortyTwoId = String(profile.id);
        const intraAvatar = profile._json.image?.link || '';

        // Check if user already exists
        let user = await prisma.user.findFirst({
            where: { OR: [{ oauthProvider: '42', oauthId: fortyTwoId }] }
        });

        
        
        if (user) return done(null, user);
        
        // if the 42 intra user email is already used by another acc stawp right there 
        const existingByEmail = await prisma.user.findUnique({ where: { email } });
        if (existingByEmail) {
            return done(null, false, {
                message: 'EMAIL_ALREADY_USED',
            });
        }

        // check if username already exists
        let finalUsername = profile.username;
        const existingUsername = await prisma.user.findUnique({ where: { username: finalUsername  } });
        if (existingUsername){ // if the username already exists , add last 4 charcaters from the id to the username
            finalUsername = `${profile.username}_${fortyTwoId.slice(-4)}`;
        }

        if (!user) {
            // If not, create them with data from Intra
            user = await prisma.user.create({
                data: {
                    email: email,
                    username: finalUsername,
                    firstname: profile.name.givenName || '',
                    lastname: profile.name.familyName || '',
                    avatar: intraAvatar,
                    oauthProvider: '42',
                    oauthId: fortyTwoId,
                    type: 'FREELANCER', // 42 students usually start as Freelancers
                    role: 'USER',       // Default permission
                    status: 'active'
                }
            });

            // Shout to Redis so Chat Service sees the new user
            await publishEvent(AUTH_EVENTS.USER_REGISTERED, {
                id: user.id,
                email: user.email,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                type: user.type,
                avatar: user.avatar
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));
