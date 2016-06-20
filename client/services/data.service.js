angular.module('app').factory('dataService', 
function($http,$q, $log, config, $timeout, CacheFactory){
  if (!CacheFactory.get('dataServiceCache')) {
      
      CacheFactory.createCache('dataServiceCache', {
        deleteOnExpire: 'aggressive',
        recycleFreq: 1 * 60 * 1000
      });
    }

    var dataServiceCache = CacheFactory.get('dataServiceCache');
    var requestOpts = {cache: dataServiceCache};
    
  return {
    apiPrefix : config.apiBaseUrl,  
    clearCache:function(){
      CacheFactory.clearAll();
    },
    getUser : function( ){
      
    },
    getConfigCategories : function(name,categoryGroup){
      var querystring = [];
      if(name != null){
          querystring.push( "name=" + name);
      }
      if(categoryGroup != null){
          querystring.push( "categoryGroup=" + categoryGroup);
      }
      var q = "?" + querystring.join("&");
      
      var url = config.apiBaseUrl + "v1/config/categories" + q;
      return $http.get(url, requestOpts);
    },
    /**
    Register yourself
    */
    saveProfile : function( model){
      var url = config.apiBaseUrl + "/v1/profile";
      return $http.post(url, model);
    },
    getUsers : function(searchTerm ){
      if(searchTerm)
      {
        return $http.get(this.apiPrefix + "/v1/user/search" + "?term=" + searchTerm, requestOpts);
      }
      else
      {
        return $http.get(this.apiPrefix + "/v1/user/search", requestOpts);
      }
    },
    
    getGroups : function(){
      var defered = $q.defer();
      var url = config.apiBaseUrl + "/v1/groups?status=active";
      $http.get(url, requestOpts)
      .then(function(d){
        defered.resolve(d);
      }, function(e){
        defered.reject(e);
      });
      return defered.promise;
    },
    getGroup     : function(id){
      
      var url = config.apiBaseUrl + "/v1/groups?_id="+id;
      return $http.get(url, requestOpts);
    },
    saveGroup : function(grp){
      
      var url = config.apiBaseUrl + "/v1/group";
      return $http.post(url, grp);
    },
    getGroupMembers : function(id){
      
      var url = config.apiBaseUrl + "/v1/group/members?groupid="+id;
      return $http.get(url, requestOpts);
    },
    /**
    * @param data : {groupId: 1, members:"1,2,3" }
    **/
    addGroupMembers : function(data){
      
      var url = config.apiBaseUrl + "/v1/group/members";
      return $http.post(url, data);
    },
    
    /**
    * @param data : {groupId: 1, members:"1,2,3" }
    **/
    removeGroupMembers : function(data){
      
      var url = config.apiBaseUrl + "/v1/group/members/remove";
      return $http.post(url, data);
    },

    /**
    * @param data : {groupId: 1, members:"1,2,3" }
    **/
    getAssets : function(filter){
      var qryString = "";

      if(filter.parentId)
      {
        if(qryString.length > 0){
          qryString+="&";
        }
        qryString+="parentId="+filter.parentId
      }
      if(filter.count)
      {
        if(qryString.length > 0){
          qryString+="&";
        }
        qryString+="count="+filter.count
      }
      if(filter.from)
      {
        if(qryString.length > 0){
          qryString+="&";
        }
        qryString+="from="+filter.from
      }

      var url = config.apiBaseUrl + "/v1/"+ filter.groupId +"/assets";
      if(qryString.length > 0){
        url+="?"+qryString;
      }
      return $http.get(url);
    },
    /**
    * @param data : {groupId: 1, members:"1,2,3" }
    **/
    getAssetTree : function(filter){
      var qryString = "";

      if(filter.parentId)
      {
        if(qryString.length > 0){
          qryString+="&";
        }
        qryString+="p="+filter.parentId
      }
      
      if(filter.levels)
      {
        if(qryString.length > 0){
          qryString+="&";
        }
        qryString+="levels="+filter.levels
      }
      
      if(filter.structureOnly)
      {
        if(qryString.length > 0){
          qryString+="&";
        }
        qryString+="structure_only=true"; 
      }
      
      var url = config.apiBaseUrl + "/v1/"+ filter.groupId +"/asset/hierarchy";
      if(qryString.length > 0){
        url+="?"+qryString;
      }
      return $http.get(url);
    },
    /**
    * @param data : {groupId: 1, members:"1,2,3" }
    **/
    getAsset : function(id){
      var url = config.apiBaseUrl + "/v1/asset?id="+id;
      
      return $http.get(url);
    },
    createAsset : function(data){
      var url = config.apiBaseUrl + "/v1/asset/create";
      return $http.post(url,data);
    },
    saveAsset : function(data){
      var url = config.apiBaseUrl + "/v1/asset";
      return $http.post(url,data);
    },
    saveAssetThumbnail : function(assetId, base64thumbnail){
        var url = config.apiBaseUrl + "/v1/asset/thumbnail/binary";
        return $http.post(url,{"assetId" : assetId, "base64ImgUrl" : base64thumbnail});
    },
    uploadThumbnail : function(fileName, base64Image){
        var url = config.apiBaseUrl + "/v1/thumbnail/binary";
        var data = {"fileName" : fileName, "imgUrl": base64Image};
        return $http.post(url,data)
    },
  };
});