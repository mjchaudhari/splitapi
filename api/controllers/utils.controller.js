var path = require("path");
var fs = require('fs-extra'); 
var shortid	= require("shortid");
var models = require("./../response.models.js").models;
var configModels = require("./../models/config.model.js");

/*
group module
*/
exports.v1 = function(dbConfig){
    var configModel = configModels(dbConfig).assetConfigModel;
    

    this.getCategories = function(name, categoryGroup, callback){
        var query = {};
        if(name){
            query.Name =  { $regex : new RegExp(name,"i") };
        }
        if(categoryGroup){
            query.ConfigGroup = { $regex : new RegExp(categoryGroup,"i") };;
        }
        
        configModel.find(query)
        .exec(function(e,g){            
            return callback(e,g);
        });
    } 
}
