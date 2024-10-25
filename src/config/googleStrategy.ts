import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const googleLogin = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: `${process.env.BASE_URL}/api/auth/redirect`,
  },
  async (token, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await new User({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          displayName: profile.displayName,
          username: `user${profile.id}`,
          image: profile.photos?.[0].value,
        }).save();
      }

      done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);

export default (passportArg: passport.PassportStatic) => {
  passportArg.use(googleLogin);
};
