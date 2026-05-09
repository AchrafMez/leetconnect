import passport from 'passport';
// import { Strategy as FortyTwoStrategy } from 'passport-42';
import prisma from '../lib/prisma';
import { publishEvent, AUTH_EVENTS } from '@leetconnect/shared';
const FortyTwoStrategy = require("passport-42").Strategy;
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log("🛠 Attempting to initialize 42 Strategy...");

passport.use('42', new FortyTwoStrategy({
    clientID: process.env.INTRA_CLIENT_ID!,
    clientSecret: process.env.INTRA_CLIENT_SECRET!,
    callbackURL: "https://localhost/api/auth/42/callback",
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
        // console.log("=== RAW 42 PROFILE DATA ===");
        // console.log(JSON.stringify(profile._json, null, 2));
        // console.log("===========================");
        const email = profile.emails[0].value;
        const fortyTwoId = String(profile.id);
        const intraAvatar = profile._json.image?.link || '';
        // Check if user already exists
        let user = await prisma.user.findFirst({
            where: { OR: [{ oauthId: fortyTwoId }, { email: email }] }
        });

        if (!user) {
            // If not, create them with data from Intra
            user = await prisma.user.create({
                data: {
                    email: email,
                    username: profile.username,
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
            console.log("user avatar-> [", profile.photos[0]?.value, "]")
            console.log("user avatar-> [", user.avatar, "]")
            // 3. Shout to Redis so Chat Service sees the new user
            await publishEvent(AUTH_EVENTS.USER_REGISTERED, {
                id: user.id,
                email: user.email,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                type: user.type,
                avatar: user.avatar,
            });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

console.log("✅ 42 Strategy registered successfully!");