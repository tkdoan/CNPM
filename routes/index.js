var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var csrf = require('csurf');
const passport = require('passport');
const { route } = require('./user');
var Handlebars = require('handlebars');
var auth=require('../config/auth').isUser;
var isUser =auth;
/* GET home page. */
router.get('/', isUser,function(req, res, next) {
  Product.find(function(err, docs){
      console.log(docs);
     var productChunks = [];
    var chunkSize = docs.length;
    for( var i= 0 ; i < docs.length ; i+= chunkSize) {
        productChunks.push(docs.splice(i, i + chunkSize));
    }
      res.render('shop/index', { title: 'Shopping Cart' , products : productChunks});
  }).lean();
  
});

router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{items:{}});

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});
router.get('/add/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{items:{}});

  cart.increaseOne(productId);
  req.session.cart =cart;
  res.redirect('/shopping-cart');
});
router.get('/reduce/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{items:{}});

  cart.reduceByOne(productId);
  req.session.cart =cart;
  res.redirect('/shopping-cart');
});
router.get('/remove/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart:{items:{}});

  cart.removeItem(productId);
  req.session.cart =cart;
  res.redirect('/shopping-cart');
});
router.get('/shopping-cart',function(req,res,next){
  if(!req.session.cart){
    return res.render('shop/shopping-cart',{products:null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart',{products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout',function(req,res,next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout',{total: cart.totalPrice});
});
router.get('/test',function(req,res){
  res.send('index test');
});
Handlebars.registerHelper("counter", function (index){
  return index + 1;
});
module.exports = router;