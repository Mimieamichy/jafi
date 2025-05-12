require('dotenv').config()
const passport = require('passport')


const clientID =     process.env.FACEBOOK_APP_ID
const clientSecret = process.env.FACEBOOK_APP_SECRET
const callbackURL =  process.env.FACEBOOK_CALLBACK_URL
const FacebookStrategy = require("passport-facebook").Strategy;


passport.use( new FacebookStrategy(
    {
      clientID:     clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
      passReqToCallback: true,
    },
    
    (req, accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);


passport.serializeUser((payload, done) => done(null, payload));
passport.deserializeUser((payload, done) => done(null, payload));

