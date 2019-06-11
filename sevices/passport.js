const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const mongoose = require('mongoose')
const keys = require('../config/keys')

const User = mongoose.model('user')

passport.serializeUser((user, done) => {
  // This id is not google profile id. It is the id generated by mongoDB
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user)
    })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id })
        if (existingUser) done(null, existingUser)
        else {
          const user = await new User({ googleClientID: profile.id }).save()
          done(null, user)
        }
      } catch (e) {
        console.log('Error occured at Passport using GoogleStrategy :', e)
      }
    }
  )
)
