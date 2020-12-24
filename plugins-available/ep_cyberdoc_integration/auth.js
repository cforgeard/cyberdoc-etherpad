const jwt = require('jsonwebtoken');

exports.authenticate = function (hook_name, context, cb) {
    cb([false]); /* always return false because authentication is done via CyberDoc backend, not via Etherpad */
}

exports.authorize = function (hook_name, context, cb) {
    try {
        const jwtToken = context.req.cookies["access_token"];
        if (!jwtToken) {
            throw new Error("Missing jwtToken");
        }

        const userHash = context.req.cookies["user_hash"];
        if (!userHash) {
            throw new Error("Missing userHash");
        }

        jwt.verify(jwtToken, `${settings.dbSettings.jwtSecret}`);
        const jwtContents = jwt.decode(jwtToken);
        context.req.session.user = {};
        context.req.session.user.jwtToken = jwtToken;
        context.req.session.user.raw_user = jwtContents.user;
        context.req.session.user.user_hash = userHash;
        context.req.session.user.id = jwtContents.user._id;
        context.req.session.user['user'] = jwtContents.user.email;
        context.req.session.user['displayName'] = jwtContents.user.firstname + ' ' + jwtContents.user.lastname;

        console.debug('CyberDocAuth.authorize OK', context.req.session.user['user'], "'" + context.req.session.user['displayName'] + "'");
        cb([true]);
    } catch (err) {
        console.error("CyberDocAuth.authorize", err.toString());
        cb([false]);
    }
}

exports.authFailure = function (hook_name, context, cb) {
    /* call when exports.authenticate returns false*/
    setTimeout(() => {
        context.res.status(403).send();
    }, 1000);
    cb([true]);
}

exports.onAccessCheck = function (hook_name, context, cb) {
    const fileCollection = db.db.wrappedDB.fileCollection;
    jwt.verify(context.token, `${settings.dbSettings.jwtSecret}`);
    const currentUser = jwt.decode(context.token).user;

    return fileCollection.findOne({ _id: context.padID }).then(doc => {
        const isFileOwner = currentUser._id === doc.owner_id;
        const haveSharedAccess = doc.sharedWith.indexOf(currentUser._id) !== -1;
        const containsSignatures = doc.signs.length > 0;

        if (context.readOnly) {
            const allowed = (isFileOwner || haveSharedAccess);
            console.info(`[CyberDocAuth] access RO ${context.padID} ${currentUser._id} allowed=${allowed}`)
            return allowed;
        } else {
            const allowed = (isFileOwner || (haveSharedAccess && doc.shareMode === "readwrite")) && !containsSignatures;
            console.info(`[CyberDocAuth] access RW ${context.padID} ${currentUser._id} allowed=${allowed}`)
            return allowed;
        }
    }).catch(err => {
        console.error(err);
        return false;
    })
}