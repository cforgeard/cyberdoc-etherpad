const settings = require('ep_etherpad-lite/node/utils/Settings');
const ReadOnlyManager = require('ep_etherpad-lite/node/db/ReadOnlyManager');
const axios = require('axios');

const cyberDocFrontendRoot = settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.cyberDocFrontendRoot;
const cyberDocApiRoot = settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.cyberDocApiRoot;
if (!cyberDocApiRoot) {
    throw new Error("[ep_cyberdoc_integration] setting ep_cyberdoc_integration.cyberDocApiRoot missing");
}

function isCyberDocAuthHooksEnabled() {
    if (settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.authHooksEnabled === true) {
        return true;
    }
    return false;
}

console.info("[ep_cyberdoc_integration]", "isCyberDocAuthHooksEnabled", isCyberDocAuthHooksEnabled());

exports.authenticate = async function (hook_name, context, cb) {
    const importPadEndpointRegex = /\/p\/([a-z0-9.-]*)\/import/;
    const exportPadEndpointRegex = /\/p\/([a-z0-9.-]*)\/export/;
    if (importPadEndpointRegex.test(context.req.url) || exportPadEndpointRegex.test(context.req.url)) {
        console.warn("[ep_cyberdoc_integration]", "authenticate", `import/export endpoint called (${context.req.ip})`, context.req.url);
        const allowed = context.req.ip === "127.0.0.1";
        if (allowed) {
            context.req.session.user = {"__fake_user_for_importexport": true, "username": "<fake_user_for_importexport>"};
        }
        return cb([allowed]);
    }

    context.req.session.redirectToLoginRequested = false;
    if (!isCyberDocAuthHooksEnabled()) return cb([true]);

    //fetch current user info from CyberDoc API
    let headers = {};
    if (context.req.headers && context.req.headers['cookie']) headers['cookie'] = context.req.headers['cookie'];
    const response = await axios({
        method: 'get',
        url: `${cyberDocApiRoot}/users/profile`,
        withCredentials: true,
        validateStatus: () => true,
        headers: headers
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
    const importPadEndpointRegex = /\/p\/([a-z0-9.-]*)\/import/;
    const exportPadEndpointRegex = /\/p\/([a-z0-9.-]*)\/export/;
    if (importPadEndpointRegex.test(context.req.url) || exportPadEndpointRegex.test(context.req.url)) {
        console.warn("[ep_cyberdoc_integration]", "authorize", `import/export endpoint called (${context.req.ip})`, context.req.url);
        const allowed = context.req.session.user && context.req.session.user['__fake_user_for_importexport'];
        return cb([allowed]);
    }


    context.req.session.redirectToLoginRequested = false;
    if (!isCyberDocAuthHooksEnabled()) return cb([true]);
    if (!context.req.session.user || !context.req.session.user._id) return cb([false]);

    if (context.resource.startsWith('/locales')) {
        return cb([true]);
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
        url: `${cyberDocApiRoot}/files/${cyberDocFileID}`,
        withCredentials: true,
        validateStatus: () => true,
        headers: headers
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
    const fileInfo = response.data.content;
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

exports.authFailure = function (hook_name, context, cb) {
    /* call when exports.authenticate returns false*/
    if (context.req.session.redirectToLoginRequested) {
        context.res.redirect(`${cyberDocFrontendRoot}/login`);
    } else {
        setTimeout(() => { context.res.status(404).send() }, 1000);
    }
    cb([true]);
}

exports.onAccessCheck = function (hook_name, context, cb) {
    return true;
}
