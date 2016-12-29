var API = API || {}

API.Exception = function(message, source, ex) {
    this.errorCode = "SERVER_ERROR"
    this.message = message;
    this.source = source || "API";
    this.name = "APIException";
    this.exception = ex;
    return this;
}

API.Exception.prototype.unauthenticated = function(message, source, ex){
    this.errorCode = "UNAUTHENTICATED";
    this.message = message || 'Unauthenticated';
    this.source = source || "API";
    this.exception = ex;
    return this;
}
API.Exception.prototype.serverError = function(message, source, ex){
    this.errorCode = "SERVER_ERROR"
    this.message = message || 'Server error';
    this.source = source || "API";
    this.exception = ex;
    return this;
}
API.Exception.prototype.invalidInput = function(message, source, ex){
    this.errorCode = "INVALID_INPUT"
    this.message = message || 'Invalid Input';
    this.source = source || "API";
    this.exception = ex;
    return this;
}

API.Exception.prototype.notFound = function(message, source, ex){
    this.errorCode = "NOT_FOUND"
    this.message = message || 'Data not found';
    this.source = source || "API";
    this.exception = ex;
    return this;
}

module.exports = new API.Exception();