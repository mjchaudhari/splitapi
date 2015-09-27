var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('model/user');
var Client = require('model/client');
var AccessToken = require(libs + './accessToken');
var RefreshToken = require(libs + './refreshToken');

