const request = require('request-promise');

class Client {
    constructor(options) { 
        this.baseUrl = options.baseUrl; 
        this.method = 'Get';
        this.auth=options.auth;
     }

     __get(url){
        this.method = 'Get';
        return this.__createUrl(url);
     }

     getCategoryById(categoryId){
        let endPoint = this.__get('categories/'+categoryId);
        return this.__apiCall(endPoint);
     }



     __apiCall(endPoint) {
         console.log('Fetching from '+endPoint);
       return request({
                url: endPoint,
                method: this.method,
                headers : {
                    'Authorization': 'Bearer ' +this.auth,
                    'accept': 'application/json',
                    'content-type': 'application/json; charset=utf-8',
                    'pragma': 'no-cache',
                    'cache-control': 'no-cache',
                },
                json: true
            });
    }

    __createUrl(resourceUrl) {
        return this.baseUrl +  resourceUrl;
    }

    __httpCallSucceeded(response) {
        return response.statusCode >= 200 && response.statusCode < 300;
    }

    __errorString(message, parameters) {
        if (parameters === null) {
            return message;
        }
        if (parameters instanceof Array) {
            for (var i = 0; i < parameters.length; i++) {
                var parameterPlaceholder = '%' + (i + 1).toString();
                message = message.replace(parameterPlaceholder, parameters[i]);
            }
        } else if (parameters instanceof Object) {
            for (var key in parameters) {
                var parameterPlaceholder = '%' + key;
                message = message.replace(parameterPlaceholder, parameters[key]);
            }
        }

        return message;
    }
     
}
module.exports = Client;