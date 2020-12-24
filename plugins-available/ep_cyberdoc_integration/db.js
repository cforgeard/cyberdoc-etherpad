var MongoClient = require('mongodb').MongoClient;

exports.database = function (settings) {
    var assertions = {
        exist: function (v) { return v !== undefined && v !== null },
        isString: function (v) { return typeof v === 'string' },
        isNumber: function (v) { return typeof v === 'number' },
    }
    var assert = function (value, assertion, message) { if (!assertion(value)) throw message }
    assert(settings, assertions.exist, 'you need to inform the settings');

    this.settings = settings;
    this.settings.collectionName = assertions.isString(this.settings.collectionName) ? this.settings.collectionName : 'store';
    assert(settings.url, assertions.exist, 'you need to specify assertions.url');

    // these values are used by CacheAndBufferLayer
    this.settings.cache = 1000;
    this.settings.writeInterval = 100;
    this.settings.json = true;
}

exports.database.prototype.init = function (callback) {
    this.onMongoReady = callback || function () { };

    var url = this.settings.url;
    MongoClient.connect(url, {}, this._onMongoConnect.bind(this));
}

exports.database.prototype._onMongoConnect = function (error, client) {
    if (error) { throw 'an error occurred [' + error + '] on mongo connect' }

    this.db = client.db(this.settings.databaseName);
    this.etherpadCollection = this.db.collection(this.settings.etherpadCollectionName);
    this.userCollection = this.db.collection(this.settings.userCollectionName);
    this.fileCollection = this.db.collection(this.settings.fileCollectionName);

    this.db.ensureIndex(this.settings.collectionName, { key: 1 }, { unique: true, background: true }, function (err, indexName) {
        if (err) {
            console.error('Error creating index');
            console.error(err.stack ? err.stack : err);
        }
    });

    exports.database.prototype.set = function (key, value, callback) {
        if (key.startsWith("pad:") || /* pad, pad revisions and pad chat storage */
            key.startsWith("comments:")) { /* pad comments, from ep_comments_page */
            this.etherpadCollection.update({ key: key }, { key: key, val: value }, { safe: true, upsert: true }, callback);
        } else {
            callback();
        }
    }

    exports.database.prototype.get = function (key, callback) {
        const objectType = key.split(":")[0];
        switch (objectType) {
            case "comments": /* pad, pad revisions and pad chat storage */
            case "pad": { /* pad comments, from ep_comments_page */
                this.etherpadCollection.findOne({ key: key }, function (err, doc) {
                    callback(err, doc && doc.val ? doc.val : doc);
                });
                break;
            }

            case "readonly2pad": { /* convert a ReadOnly padID to a ReadWrite padID */
                callback(null, JSON.stringify(key.split(":")[1].split("r.")[1]));
                break;
            }

            case "pad2readonly": { /* convert a ReadWrite padID to a ReadOnly padID */
                callback(null, JSON.stringify("r." + key.split(":")[1]));
                break;
            }

            case "globalAuthor": { /* author */
                const objectID = key.split(":")[1];
                this.userCollection.findOne({ _id: objectID }, function (err, doc) {
                    if (err || !doc) {
                        callback(err, null);
                    } else {
                        callback(null, JSON.stringify({
                            name: `${doc.firstname} ${doc.lastname}`,
                            colorId: doc.hexColor
                        }))
                    }
                });
                break;
            }

            default: { /* other data is not stored */
                callback(null, null);
            }
        }
    }

    exports.database.prototype.remove = function (key, callback) {
        this.etherpadCollection.remove({ key: key }, { safe: true }, callback);
    }

    exports.database.prototype.findKeys = function (key, notKey, callback) {
        var findRegex = this.createFindRegex(key, notKey);
        this.etherpadCollection.find({ key: findRegex }).toArray(function (err, docs) {
            docs = docs || [];
            var keys = docs.map(function (doc) { return doc.key });

            callback(err, keys);
        });
    }

    exports.database.prototype.doBulk = function (bulkOperations, callback) {
        var operations = {
            'set': 'updateOne',
            'remove': 'deleteOne',
        }

        var mongoBulkOperations = [];
        for (var i in bulkOperations) {
            var eachUeberOperation = bulkOperations[i];
            var mongoOperationType = operations[eachUeberOperation.type];
            if (eachUeberOperation.key.startsWith("pad:") || eachUeberOperation.key.startsWith("comments:")) {
                var mongoOperationDetails = {
                    filter: { key: eachUeberOperation.key },
                    update: { $set: { val: eachUeberOperation.value } },
                    upsert: true,
                };
                var eachBulk = {}
                eachBulk[mongoOperationType] = mongoOperationDetails;
                mongoBulkOperations.push(eachBulk);
            }
        }

        if (mongoBulkOperations.length > 0) {
            this.etherpadCollection.bulkWrite(mongoBulkOperations, callback);
        } else {
            callback();
        }

    }

    exports.database.prototype.close = function (callback) { this.db.close(callback) }

    this.onMongoReady(error, this);
}
