const axios = require('axios');
const padMessageHandler = require('ep_etherpad-lite/node/handler/PadMessageHandler');
const settings = require('ep_etherpad-lite/node/utils/Settings');

const cyberDocApiRoot = settings.ep_cyberdoc_integration && settings.ep_cyberdoc_integration.cyberDocApiRoot;
if (!cyberDocApiRoot) {
    throw new Error("[ep_cyberdoc_integration] setting ep_cyberdoc_integration.cyberDocApiRoot missing");
}

exports.userLeave = function (hook_name, context, cb) {
    let headers = {};
    if (context.handshake.headers && context.handshake.headers['cookie']) headers['cookie'] = context.handshake.headers['cookie'];
    const padID = context.padId;
    
    if (padMessageHandler.padUsersCount(padID).padUsersCount === 0) {
        console.info(`[ep_cyberdoc_integration] call on-all-users-leave-etherpad-pad endpoint (padID=${padID})`)
        axios({
            method: 'get',
            headers: headers,
            url: `${cyberDocApiRoot}/files/${padID}/on-all-users-leave-etherpad-pad`,
            withCredentials: true,
        })
    }
    return cb();
}
