const axios = require('axios');
const padMessageHandler = require('ep_etherpad-lite/node/handler/PadMessageHandler');
const settings = require('ep_etherpad-lite/node/utils/Settings').ep_cyberdoc_integration;

function getValueFromSettings(key) {
    if (!settings || !settings[key]) {
        throw new Error(`[ep_cyberdoc_integration] Missing ep_cyberdoc_integration.${key} setting !`);
    }
    return settings[key];
}


const enableUserLeaveHandler = settings && settings['enableUserLeaveHandler'];
console.warn("[ep_cyberdoc_integration]", `enableUserLeaveHandler=${enableUserLeaveHandler}`);

if (enableUserLeaveHandler) {
    exports.userLeave = function (hook_name, context, cb) {
        const padID = context.padId;
        const cookieHeaderValue = context.handshake.headers && context.handshake.headers['cookie'];
        if (!cookieHeaderValue) {
            throw new Error("[ep_cyberdoc_integration] (userLeave) Missing 'cookie' header");
        }
    
        if (padMessageHandler.padUsersCount(padID).padUsersCount === 0) {
            console.info(`[ep_cyberdoc_integration] call on-all-users-leave-etherpad-pad endpoint (padID=${padID})`)
            axios({
                method: 'get',
                headers: {'cookie': cookieHeaderValue},
                url: `${getValueFromSettings('backendBaseURL')}/files/${padID}/on-all-users-leave-etherpad-pad`,
            }).then(response => {
                if (response.status !== 200) {
                    console.error("[ep_cyberdoc_integration]", "userLeave api call failed", JSON.stringify(response));
                }    
            }).catch(err => {
                console.error("[ep_cyberdoc_integration]", "userLeave api call failed", JSON.stringify(err));
            })
        }
        return cb();
    }
} else {
    exports.userLeave = function (hook_name, context, cb) {
        return cb();
    }
}