/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: vid.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: VID Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require(".")
const private = {}


/////////////////
// Class: VID //
/////////////////

vKit.vid = {}
private.buffer = {}
private.counter = 0

// @Desc: Creates a unique vid
vKit.vid.create = () => {
    var vid = false
    while(!vid) {
        const vvid = vKit.toBase64(vKit.crypto.getRandomValues(new Uint8Array(8)).join("") + (Date.now() + private.counter))
        if (vKit.vid.blacklist(vvid)) vid = vvid
        private.counter += 1
    }
    return vid
}

// @Desc: Blacklists a vid
vKit.vid.blacklist = (vid) => {
    if (!vKit.isString(vid) || private.buffer[vid]) return false
    private.buffer[vid] = true
    return true
}

// @Desc: Assigns/Fetches vid on/from instance
vKit.vid.fetch = (parent, assignVID, isReadOnly) => {
    if (vKit.isNull(parent) || vKit.isBool(parent) || vKit.isString(parent) || vKit.isNumber(parent)) return false
    parent.prototype = parent.prototype || {}
    if (!isReadOnly && !parent.prototype.vid) {
        Object.defineProperty(parent.prototype, "vid", {value: assignVID || `${vKit.identifier}:${vKit.vid.create()}`, enumerable: true, configurable: false, writable: false})
    }
    return parent.prototype.vid
}