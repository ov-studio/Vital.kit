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


/////////////////
// Class: VID //
/////////////////

const CVID = vKit.Class()
vKit.vid = CVID.public
CVID.private.buffer = vKit.Object()
CVID.private.counter = 0


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a unique VID
CVID.public.addMethod("create", () => {
    var vid = false
    while(!vid) {
        const vvid = vKit.toBase64(vKit.crypto.getRandomValues(new Uint8Array(8)).join("") + (Date.now() + CVID.private.counter))
        if (CVID.public.blacklist(vvid)) vid = vvid
        CVID.private.counter += 1
    }
    return vid
})

// @Desc: Blacklists a VID
CVID.public.addMethod("blacklist", (vid) => {
    if (!vKit.isString(vid) || CVID.private.buffer.get(vid)) return false
    CVID.private.buffer.set(vid, true)
    return true
})

// @Desc: Assigns/Fetches VID (Virtual ID) on/from valid instance
CVID.public.addMethod("fetch", (parent, assignVID, isReadOnly) => {
    if (vKit.isNull(parent) || vKit.isBool(parent) || vKit.isString(parent) || vKit.isNumber(parent)) return false
    parent.prototype = parent.prototype || {}
    if (!isReadOnly && !parent.prototype.vid) {
        Object.defineProperty(parent.prototype, "vid", {value: assignVID || `${vKit.identifier}:${vKit.vid.create()}`, enumerable: true, configurable: false, writable: false})
    }
    return parent.prototype.vid
})