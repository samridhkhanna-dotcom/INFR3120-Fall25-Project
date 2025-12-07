const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// -------------------------
// LOCAL LOGIN STRATEGY
// -------------------------
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "User not found" });

      const match = await user.comparePassword(password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// -------------------------
// GOOGLE OAUTH STRATEGY
// -------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        const email =
          profile.emails?.[0]?.value || `google_${profile.id}@noemail.com`;

        let baseUsername = profile.displayName.replace(/\s+/g, "");
        let finalUsername = baseUsername;
        let counter = 1;

        while (await User.findOne({ username: finalUsername })) {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }

        user = new User({
          username: finalUsername,
          email,
          googleId: profile.id,
          profilePic: profile.photos?.[0]?.value || ""
        });

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// -------------------------
// GITHUB OAUTH STRATEGY
// -------------------------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (user) return done(null, user);

        const email =
          profile.emails?.[0]?.value || `github_${profile.id}@noemail.com`;

        let baseUsername = profile.username;
        let finalUsername = baseUsername;
        let counter = 1;

        while (await User.findOne({ username: finalUsername })) {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }

        user = new User({
          username: finalUsername,
          email,
          githubId: profile.id,
          profilePic: profile.photos?.[0]?.value || ""
        });

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// -------------------------
// SESSION HANDLING
// -------------------------
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
