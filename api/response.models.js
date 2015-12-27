var m = {
    error: function(ex, msg){
        this.isError=true;
        this.message=msg;
        this.err = ex;
    },
    
    success :function(data, msg){
        this.isError=false;
        this.data = data;
        this.message=msg
    },
    
    asset : function(){
        return{
            
            "Name": null,
            "Description": null,
            "Version": 0,
            "Status": null,
            "IsCollection": null,
            "_level":null,
            "AssetType":null,
            
            "Stat": {
              "Comments": 0,
              "Likes": 0,
              "Feedbacks": 0,
              "Views": 0
            },
            "UpdatedOn": null,
            "CreatedOn": null,
            "Path": [
              
            ],
            "Parents": [],
            "allowDownload": true,
            "Locale": "en-us",
        
            parse : function(assetModel){
                var a = assetModel.toObject();
                
                this.Name = a.Name;
                this.Description = a.Description;
                this.Version= a.Version;
                this.Status = a.Status;
                this.IsCollection =  a.IsCollection;
                this.AssetType = a.AssetType;
                
                if(a.Stat){
                    this.Stat.Comments = a.Stat.Comments;
                    this.Stat.Likes = a.Stat.Likes;
                    this.Stat.Feedbacks = a.Stat.Feedbacks;
                    this.Stat.Views = a.Stat.Views
                }
                
                this.UpdatedOn = a.UpdatedOn;
                this.CreatedOn =  a.CreatedOn;
                this.Path = a.Path;
                this.Parents = a.Parents; 
                this.allowDownload = a.allowDownload;
                this.Locale = a.Locale;
                this._level = a._level
                return this;
            }
        }
    
    },
    
}
exports.models = m;


