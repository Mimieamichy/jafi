require('dotenv').config()

const AppleStrategy = require("passport-apple").Strategy;
passport.use(
  new AppleStrategy(
    {
      clientID:           process.env.APPLE_CLIENT_ID,
      teamID:             process.env.APPLE_TEAM_ID,
      keyID:              process.env.APPLE_KEY_ID,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
      callbackURL:        process.env.APPLE_CALLBACK_URL,
      scope:              ["name", "email"],
      passReqToCallback:  true,
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        const oauthUser = {
          email: profile.email,
          name:  profile.name
            ? `${profile.name.firstName} ${profile.name.lastName}`
            : undefined,
          picture: null,
        };
        const result = await AuthService.registerReviewerWithOAuth(oauthUser, "apple");
        done(null, result);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((payload, done) => done(null, payload));
passport.deserializeUser((payload, done) => done(null, payload));

