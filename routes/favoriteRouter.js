const express = require('express');
const favoriteRouter = express.Router();
const Favorite = require('../models/favorite');
const bodyParser = require('body-parser');
const cors = require('./cors');
const authenticate = require('../authenticate');

favoriteRouter.use(bodyParser.json());

 // All Favorites
 favoriteRouter.route(`/`)
 .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) 
     .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
       Favorite.findOne({user: req.user._id })  // Find current users favorites
        .populate('favorites.campsites').populate('user')
        .then(favorites => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites)
        })
       .catch(err => next(err));          
     })
     .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id })  // Find current users favorites
        .then(favorite => {
          if (favorite) {     // check if user currently has any favorites
            req.body.forEach(reqEl => {   // check if any chosen favorites already exist
              if (favorite.campsites.every(favEl => reqEl._id != favEl)) {
                favorite.campsites.push(reqEl);    // no duplicates, add campsite to favorites list
              } else console.log(`${reqEl._id} already added as favorite`);
            });
            favorite.save()   // update favorites document in db
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }, (err) => next(err));
          }
          else {          // user has no favorites, create new favorite document
            Favorite.create({"user": req.user._id, "campsites": req.body})
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }, (err) => next(err));
          }
        }, (err) => next(err))   
        .catch(err => next(err));  
     })
     .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
       res.statusCode = 403;
       res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
     })
     .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
       Favorite.findOneAndDelete({user: req.user._id })  // Find current users favorites, and delete doc
       .then(response => {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         res.json(response);
       })
       .catch(err => next(err));           
     });
 

// Specific Favorite
favoriteRouter.route(`/:campsiteId`)
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findByIdAndUpdate(req.params.campsiteId, {
      $set: req.body
    }, { new: true })
    .then(favorite => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
    })
    .catch(err => next(err));     
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(response);
    })
    .catch(err => next(err));           
  });

 module.exports = favoriteRouter;