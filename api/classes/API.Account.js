
'use strict';
var mongo = require("./../db.connection.js");
var shortId = require("shortid");
var apiException = require("./API.Exception.js");

var API = API || {}; // Namespace
API.Account = function (){

};
/**
 * update user profile 
 * @param {object} user - user object to update
 * @return {object} userProfile - profile of the user
 * @return {string} userProfile.userName - user name
 * @return {string} userProfile.firstName - first name of the user
 * @return {string} userProfile.lastName - Last Name of the user
 * @return {string} userProfile.picture - picture of the user
 * @return {string} userProfile - EmailId of the user
 * @return {string} userProfile - Address of the user
 * @return {string} userProfile - City of the user
 * @return {string} userProfile - ZipCode of the user
 * @return {string} userProfile - ZipCode of the user
 */
API.Core.prototype.update = function(u, cb){
    //Find if this user already exist
    var filter = {"userName": user.userName};
    mongo.client.connect(mongo.uri, function(conErr, db){
        var filter = {"userName":user.UserName};
        db.collection("profiles").find(filter).toArray(function(e, data){
            if (e) {
                db.close();
                return cb(apiException.invalidInput(e.message, "Account")); 
            }
            var p = {
            };
            if (u.firstName){ p.firstName = u.firstName;}
            if (u.lastName){ p.lastName = u.lastName}
            if (u.alternateEmail) {p.alternateEmail = u.alternateEmail;}
            if (u.emailId){ p.emailId = u.emailId;}
            if (u.picture){ p.picture = u.picture;}
            if (u.address){ p.address = u.address;}
            if (u.city) { p.city = u.city;}
            if (u.country){ p.country = u.country}
            if (u.zipCode){ p.zipCode = u.zipCode}
            
            db.collection("profiles").insert(p, {"forceServerObjectId": false, "upsert": true, "fullResult": true}, function (e, data) {
                if (e) {
                    db.close();
                    return cb(apiException.serverError(null, "Core", e));
                }
                return cb(null, p);
            });
        });
    });//mongo connect
};

module.exports = API.Account;