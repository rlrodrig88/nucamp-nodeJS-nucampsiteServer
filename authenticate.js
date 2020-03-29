const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
  return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(
  new JwtStrategy(
    opts,
    (jwt_payload, done) => {
      console.log('JWT payload:', jwt_payload);
      User.findOne({_id: jwt_payload._id}, (err, user) => {
        if (err) {
          return done(err, false);
        } else if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);

// token will be included in the auth. header (line: 19)
// will always return a req.user
exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = ((req, res, next) => {
  console.log(`${req.user.username} is admin? ${req.user.admin}`);
  if (req.user.admin === false) {
    const err = new Error('You are not authorized to perform this operation!')
    res.statusCode = 403;
    return next(err);
  } else return next();
});