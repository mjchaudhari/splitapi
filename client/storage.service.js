/*
  Storage should store all data in main wrapper object with name cp-data.
  Ideal structure
  cp-api = {
    [key:value]
  }
  
  e.g.
  cp-api = {
      user:{FirstName: abc, 
      LastName : 'xyz', 
      AccessToken:'asdf-asd-afdgdg-', 
      dp:"asdf/asdf/asf"
      Status: "REGISTERED"
    }
  }
*/

angular.module('app').factory('storageService', 
function($q, $log, $localStorage){
  
  var createStorageIfNotExist = function(){
    if($localStorage["cp-data"] === undefined)
      {
        $localStorage["cp-data"] = {};  
      }
  }
  createStorageIfNotExist();
  return {
    appName : "cp-data",
    add : function(key, val)
    {
      createStorageIfNotExist();      
      if($localStorage["cp-data"][key] === undefined)
      {
        $localStorage["cp-data"][key] = {};  
      }
      $localStorage["cp-data"][key] = val;
    },
    
    get : function(key)
    {
      if($localStorage["cp-data"] == null){

        return null;
      }
      if($localStorage["cp-data"] && key){

        return $localStorage["cp-data"][key];
      }
      else{
        return $localStorage["cp-data"];
      }
    },    
    remove : function(key)
    {
      createStorageIfNotExist();
      if(key){
        if($localStorage["cp-data"][key] != undefined)
        {
          $localStorage["cp-data"][key] = undefined;  
        }
      } else{
        $localStorage["cp-data"] = {};
      }

    }
    
  };
});