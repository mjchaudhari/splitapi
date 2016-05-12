var mongoose = require('mongoose');
var shortId     =require("shortid");
var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

var options = {discriminatorKey: 'kind'};

var assetSchema = new Schema({
    //_id:{type:Number, unique:true, required:true,},//This id will be used as public facing Id
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    _uid: {
	    type: String,  
	},
    AssetCategory:{
        type : String, 
        ref:'Configs'
    },
    Name:{type : String, required:true},
    Description:{type : String},
    Locale : {
        type : String,
        default:"en-us"
    },
    Publish : {type:Boolean, default: true}, 
    AllowComment : {type:Boolean, default: true},
    AllowLike : {type:Boolean, default: true}, 
    Status : {type : String},
    Thumbnail:{type : String},
    Urls:[{type : String}],
    Moderators : [{
        _id: false,
        type : String, 
        ref:'Profiles'
    }],
    ActivateOn : {type:Date, default:Date.now()   },
    ExpireOn : {type:Date, default:Date.now()   },
    
    UpdatedOn : {type:Date, default:Date.now()},
    UpdatedBy:{
                type : String, 
                ref:'Profiles'
    },
    AuditTrail : [
        {
            _id:false,
            Action:{type : String},
            UpdatedBy:{
                type : String, 
                ref:'Profiles'
            },        
            UpdatedOn:{type:Date, default:Date.now()},
            Description: {type : String},
            Notify:{type:Boolean}
        }
    ],
    GroupId:
    {
        type : String, 
        ref:'Groups'
    },
    Paths:[
        {type : String}
    ],
    
}, options);

/**   topic Type */
var topicSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    isContainer:{
        type:Boolean, 
        default:true
    },
    allowedTypes : [{
        
        type : String, 
        ref:'Configs'
    }],
}, options);



/**   topic Type ends */

/**   post Type */
var postSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    postType:{type : String,  default:'Document'}
}, options);

/**   post Type ends */

/**   event Type */
var eventSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    startDate:{type:Date, default : Date.now()},
    endDate:{type:Date},
    venue:{type : String},
    venueAddress:{type : String},
    venueMapLocation:{type : String},
    contact:[{
                name: { type : String },
                phone: { type : String },
                email: { type : String },
                description: { type : String }
            }],
    
    allowedTypes : [{
        _id: false,
        type : String, 
        ref:'Configs'
    }],
}, options);
/**   event Type ends */

/**   action Type */
var activitySchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    activityType:{type : String, enum:['Task','Concern', 'Incident']},
    status:{type : String},
    isClosed:{type:Boolean, default:false},
    closedOn:{type:Date },
    owners:[
        {type : String, 
        ref:'Profiles'}
    ],
    updates:[{
        update:{type: String},
        updateOn:{type:Date, default: Date.now()},
        updateBy:{
            type : String, 
            ref:'Profiles'}
    }],
}, options);
/**   issue Type ends */

/**   demand Type */
var demandSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    description:{type : String},
    tranType:{type : String},
    closedDate:{type:Date, default: Date.now()},
    tranDetails:{type : String}, //cash payment, debit card, credit card, cheque no etc
    tranRef:{type : String},  //transaction no, chque no, cash
    tranStatus:{type : String, default:'complete'},
    fulfillments:[
        {
            isAccepted:{type:Boolean, default:false},
            acceptedOn:{type:Date},
            status:{type : String},
            isFulfilled:{type:Boolean, default:false},
            fulfilledOn:{type:Date},
            fulfilledByName:{type : String},
            fulfilledBy: {type : String, 
                ref:'Profiles'},
            artifactRef:{
                type : String,
                ref:"Artifacts"}
        }
    ],
    approvedBy:[
        {type : String, 
        ref:'Profiles'}
    ]
}, options);

/**   demand Type ends */
/**   transaction Type */
var transactionSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    description:{type : String},
    tranType:{type : String},
    tranDate:{type:Date, default:new Date()},
    tranDetails:{type : String}, //cash payment, debit card, credit card, cheque no etc
    tranRef:{type : String},  //transaction no, chque no, cash
    tranStatus:{type : String, default:'complete'},
    demandRef:{
        _id:false,
        type: String,
        ref:'Assets'
    },
    approvedBy:[
        {type : String, 
        ref:'Profiles'}
    ]
}, options);
/**   transaction Type ends */

/**   auestionnaire Type */
var questionnaireSchema = new Schema({
    _id: {
	    type: String,
	    unique: true,
	    default: shortId.generate
	},
    description:{type : String},
    questionaireType:{type : String, enum: ['Survey', 'Poll','Quiz','Feedback'], default:'Survey'},
    startDate:{type:Date, default: Date.now()},
    endDate:{type:Date},
    questions:[
        {
            //_id:true,
            isOptional:{type:Boolean, default:false},
            questionText:{type : String},
            questionType:{type : String, enum: ['sc', 'mcq','text'], default:'sc'},
            options:[{
                //_id:true,
                answer:{type : String},
                isCorrectAnswer:{type:Boolean, default:false},
                answeredBy:[{
                    type : String, 
                    ref:'Profiles'
                }]
            }]
        }
    ],
}, options);

/**   questionnaire Type ends */

module.exports = function(dbConfig){
    var _assetModel = dbConfig.conn.model("Assets", assetSchema);
    //Add descriminitors
     var topic = _assetModel.discriminator('Topic', topicSchema);
    var post = _assetModel.discriminator('Post', postSchema);
    var event = _assetModel.discriminator('Event', eventSchema);
    var activity = _assetModel.discriminator('activity', activitySchema);
    var demand = _assetModel.discriminator('Demand', demandSchema);
    var transaction = _assetModel.discriminator('Transaction', transactionSchema);
    var questionnaire = _assetModel.discriminator('Questionnaire', questionnaireSchema);

    var init = function (){
    };
    
    init();
    return { 
        assetModel: _assetModel,
        
    };
}
