///<reference path='references.ts' />

class ResourceService implements IResourceService {

    public name:string;
    public type: string;
    public resource: any;
    public items: any[];
    public parent: any;
    public params: any[];
    public currentItem: any;
    public currentItemIndex: number;
    public searchModel: any;
    public getListTime: any;
    public metadata: any[] = [];
    public searchFilter: string;
    public config: any;
    public $injector: any;

    constructor($injector, $resource) {
        "use strict";
        this.name = "couchdb";
        this.type = "nosql";
        this.$injector = $injector;
        this.config = $injector.get("ApplicationConfig");
        this.resource =
            //http://127.0.0.1:5984/work-requests/_design/api/_list/all/default
            $resource(
                '',
                { },
                {
                    create: {
                        url: this.config.couchDBBasePath + ':resourceName/_design/api/_update/save/:docId',
                        method: 'POST',
                        params: { docId: '@id' }
                    },
                    update: {
                        url: this.config.couchDBBasePath + ':resourceName/_design/api/_update/save/:docId',
                        method: 'PUT',
                        params: { docId: '@id' }
                    },
                    delete: {
                        url: this.config.couchDBBasePath + ':resourceName/:docId',
                        method: 'DELETE',
                        params: { docId: '@id', rev: '@_rev' }
                    },
                    query: {
                        url: this.config.couchDBBasePath + ':resourceName/_design/api/_list/all/default',
                        method: 'GET',
                        isArray: true
                    },
                    get: {
                        url: this.config.couchDBBasePath + ':resourceName/_design/api/_show/detail/:docId',
                        method: 'GET',
                        params: { docId: '@id' }
                    },
                    counter: {
                        url: this.config.couchDBBasePath + 'counters/_design/api/_update/counter/:resourceName',
                        method: 'POST',
                        params: { resourceName: '@resourceName' }
                    }
                }
            );
    }

    public getList(params):ng.IPromise<any> {
        "use strict";
        return this.resource.query({resourceName: params.resourceName}).$promise;
    }

    public createItem(params, item):ng.IPromise<any> {
        "use strict";
        //var _this = this;
        if (item.id){
            return this.resource.create({resourceName: params.resourceName}, item).$promise;
        } else {
            return this.resource
                .counter({}, {resourceName: params.resourceName}).$promise
                .then( (data) => {
                    item.id = '' + data.counter;
                    return this.resource.create({resourceName: params.resourceName}, item).$promise;
                });
        }
    }

    public getItem(params):ng.IPromise<any> {
        "use strict";
        return this.resource.get({resourceName: params.resourceName}, { id: params.id }).$promise;
    }

    public updateItem(params, item):ng.IPromise<any> {
        "use strict";
        return this.resource.update({resourceName: params.resourceName}, item).$promise;
    }

    public deleteItem(params, item):ng.IPromise<any> {
        "use strict";
        return this.resource.delete({resourceName: params.resourceName}, item).$promise;
    }

    public setParameters(params:any) {
        "use strict";
        this.params = params;
    }
}

angular.module('cheese').factory('ResourceService', ['$injector', '$resource', ResourceService]);

/*
 Create "_design/api" document in database

 curl -X PUT http://127.0.0.1:5984/work-requests
 curl -X PUT http://127.0.0.1:5984/work-requests/_design/api --data-binary @mydesign.json

 {
 "_id": "_design/api",
 "lists": {
 "all": "function(head, req) { var values = []; while (row = getRow()) { values.push(row.value); } return JSON.stringify(values); }"
 },
 "shows": {
 "detail": "function(doc, req) { var myDoc = JSON.parse(JSON.stringify( doc )); delete myDoc['_revisions']; myDoc.id = myDoc._id; return { 'json': myDoc }; }"
 },
 "views": {
 "default": {
 "map": "function (doc){ var myDoc = JSON.parse(JSON.stringify( doc )); myDoc.id = myDoc._id; emit(myDoc._id, myDoc); }"
 }
 }
 }
 */