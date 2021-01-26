const ReadOnlyManager = require('ep_etherpad-lite/node/db/ReadOnlyManager');
const axios = require('axios');
const settings = require('ep_etherpad-lite/node/utils/Settings').ep_cyberdoc_integration;

function getValueFromSettings(key) {
    if (!settings || !settings[key]) {
        throw new Error(`[ep_cyberdoc_integration] Missing ep_cyberdoc_integration.${key} setting !`);
    }
    return settings[key];
}

function isImportOrExportEndpoint(url) {
    return (/\/p\/([a-z0-9.-]*)\/import/.test(url)
        || /\/p\/([a-z0-9.-]*)\/export/.test(url))
}

function isImportOrExportAllowed(ip) {
    return ip === "127.0.0.1" || ip.includes("172.17"); //docker IPs
}

const enableAuthHooks = settings && settings['enableAuthHooks'];
console.warn("[ep_cyberdoc_integration]", `enableAuthHooks=${enableAuthHooks}`);

if (enableAuthHooks) {
    exports.authenticate = async function (hook_name, context, cb) {
        context.req.session.redirectToLoginRequested = false;

        //special case for import/export endpoint
        if (isImportOrExportEndpoint(context.req.url)) {
            console.warn("[ep_cyberdoc_integration]", "authenticate", `import/export endpoint called (${context.req.ip})`, context.req.url);
            const allowed = isImportOrExportAllowed(ip);
            if (allowed) {
                context.req.session.user = { "__fake_user_for_importexport": true, "username": "<fake_user_for_importexport>" };
            }
            return cb([allowed]);
        }

        const cookieHeaderValue = context.req.headers && context.req.headers['cookie'];
        if (!cookieHeaderValue) {
            throw new Error("[ep_cyberdoc_integration] (authenticate) Missing 'cookie' header");
        }

        //fetch current user info from CyberDoc API
        const response = await axios({
            method: 'get',
            url: `${getValueFromSettings('backendBaseURL')}/users/profile`,
            validateStatus: () => true,
            headers: { 'cookie': cookieHeaderValue },
        });

        //check response httpCode
        if (response.status === 401) {
            context.req.session.redirectToLoginRequested = true;
            return cb([false]);
        } else if (response.status !== 200) {
            console.error("[ep_cyberdoc_integration]", "authenticate", `returns false because bad httpCode from CyberDoc API (${response.status}) ${JSON.stringify(response.data)}`, context.resource);
            return cb([false]);
        }

        //process userInfo
        const user = response.data.user;
        context.req.session.user = user;
        context.req.session.user['username'] = `${user.email}`;
        context.req.session.user['displayName'] = `${user.firstname} ${user.lastname}`;
        console.debug("[ep_cyberdoc_integration]", "authenticate", "OK", JSON.stringify(user));
        return cb([true]);
    }

    exports.authorize = async function (hook_name, context, cb) {
        context.req.session.redirectToLoginRequested = false;
        if (context.resource.startsWith('/locales')) return cb([true]);

        //special case for import/export endpoint
        if (isImportOrExportEndpoint(context.req.url)) {
            console.warn("[ep_cyberdoc_integration]", "authorize", `import/export endpoint called (${context.req.ip})`, context.req.url);
            const allowed = context.req.session.user && context.req.session.user['__fake_user_for_importexport'];
            return cb([allowed]);
        }

        //the user has to be authentificated before
        if (!context.req.session.user || !context.req.session.user._id) return cb([false]);
        const cookieHeaderValue = context.req.headers && context.req.headers['cookie'];
        if (!cookieHeaderValue) {
            throw new Error("[ep_cyberdoc_integration] (authorize) Missing 'cookie' header");
        }

        //get padID
        const getPadIDRegex = /\/p\/([a-z0-9.-]*)/;
        const getPadIDRegexResult = getPadIDRegex.exec(context.resource);
        if (!getPadIDRegexResult || getPadIDRegexResult.length !== 2) {
            console.error("[ep_cyberdoc_integration]", "authorize", "returns false because no padID in URL", context.resource);
            return cb([false]);
        }
        const padID = getPadIDRegexResult[1];

        //convert padID if necessary
        const readOnlyMode = padID.startsWith('r.');
        let cyberDocFileID = "";
        if (readOnlyMode) {
            cyberDocFileID = await ReadOnlyManager.getPadId(padID);
        } else {
            cyberDocFileID = padID;
        }

        //fetch file info from CyberDoc API
        let headers = {};
        if (context.req.headers && context.req.headers['cookie']) headers['cookie'] = context.req.headers['cookie'];
        const response = await axios({
            method: 'get',
            url: `${getValueFromSettings('backendBaseURL')}/files/${cyberDocFileID}/sync-file-with-etherpad-and-get-info`,
            validateStatus: () => true,
            headers: { 'cookie': cookieHeaderValue },
        });

        //check response httpCode
        if (response.status === 401) {
            context.req.session.redirectToLoginRequested = true;
            return cb([false]);
        } else if (response.status !== 200) {
            console.error("[ep_cyberdoc_integration]", "authorize", `returns false because bad httpCode from CyberDoc API (${response.status}) ${JSON.stringify(response.data)}`, context.resource);
            return cb([false]);
        }

        //process fileInfo
        const fileInfo = response.data.file;
        const availableAccess = fileInfo.access; //[ none, read, write, owner ]
        const containsSignatures = fileInfo.signs.length > 0;
        let allowed = false;

        if (readOnlyMode) {
            allowed = availableAccess !== "none";
        } else {
            allowed = (availableAccess === "owner" || availableAccess === "write") && !containsSignatures;
        }

        if (allowed) {
            console.warn("[ep_cyberdoc_integration]", "authorize", `allowed=${allowed}`, `readOnlyMode=${readOnlyMode}`, `cyberDocFileID=${cyberDocFileID}`);
        } else {
            console.error("[ep_cyberdoc_integration]", "authorize", `allowed=${allowed}`, `readOnlyMode=${readOnlyMode}`, `cyberDocFileID=${cyberDocFileID}`);
        }

        return cb([allowed]);
    }
} else {
    exports.authenticate = async function (hook_name, context, cb) {
        return cb([true]);
    }
    exports.authorize = async function (hook_name, context, cb) {
        return cb([true]);
    }
}

exports.authFailure = function (hook_name, context, cb) {
    /* call when exports.authenticate returns false*/
    if (context.req.session.redirectToLoginRequested) {
        context.res.redirect(`${getValueFromSettings('frontendBaseURL')}/login`);
    } else {
        setTimeout(() => { context.res.status(404).send() }, 1000);
    }
    cb([true]);
}
