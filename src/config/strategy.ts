import passportGoogle from "passport-google-oauth20";
import User from "../models/User";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

export = function (passport: passport.PassportStatic) {
  const GoogleStrategy = passportGoogle.Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/api/auth/redirect",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            done(null, user);
          }

          const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            username: `user${profile.id}`,
            email: profile.emails?.[0].value as string,
            image: profile.photos?.[0].value as string,
          };

          user = await User.create(newUser);
          done(null, user);
        } catch (err) {
          done(err, undefined);
          console.log(err);
        }
      }
    )
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET as string,
      },
      async (jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.userId);

          if (user) {
            return done(null, user);
          } else {
            done(null, false);
          }
        } catch (err) {
          done(err, false);
        }
      }
    )
  );
};
