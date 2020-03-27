const express = require('express');
const bodyParser = require('body-parser');
const Partner = require('../models/partner');
const authenticate = require('../authenticate');
const partnerRouter = express.Router();

partnerRouter.use(bodyParser.json());

// All Partners
partnerRouter.route(`/`)
    .get((req, res, next) => {
      Partner.find()
      .then(partners => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners);
      })
      .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
      Partner.create(req.body)
      .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
      })
      .catch(err => next(err));    
    })
    .put(authenticate.verifyUser, (req, res) => {
      res.statusCode = 403;
      res.end(`PUT operation not supported on /partners`);
    })
    .delete(authenticate.verifyUser, (req, res) => {
      Partner.deleteMany()
      .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch(err => next(err));     
    });

 // Specific Partner
partnerRouter.route(`/:partnerId`)
    .get((req, res, next) => {
      Partner.findById(req.params.partnerId)
      .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner)
      })
      .catch(err => next(err));          
    })
    .post(authenticate.verifyUser, (req, res, next) => {
      res.statusCode = 403
      res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(authenticate.verifyUser, (req, res) => {
      Partner.findByIdAndUpdate(req.params.partnerId, {
        $set: req.body
      }, { new: true })
      .then(partner => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
      })
      .catch(err => next(err));     
    })
    .delete(authenticate.verifyUser, (req, res) => {
      Partner.findByIdAndDelete(req.params.partnerId)
      .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch(err => next(err));           
    });

module.exports = partnerRouter;