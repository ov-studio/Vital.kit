/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CHTTPS = require("https")


/////////////////////
// Class: Utility //
/////////////////////

const CKit = {
    print: console.log,
    loadString: eval,
    queryString: require("querystring")
}
Object.defineProperty(CKit, "isServer", {value: ((typeof(process) != "undefined") && !process.browser && true) || false, enumerable: true, configurable: false, writable: false})
Object.defineProperty(CKit, "global", {value: (CKit.isServer && global) || window, enumerable: true, configurable: false, writable: false})
CKit.crypto = (CKit.isServer && require("crypto")) || crypto
CKit.crypto.getRandomValues = CKit.crypto.getRandomValues || ((buffer) => {
    if (buffer instanceof Uint8Array) {
        buffer.set(CKit.crypto.randomBytes(buffer.length))
        return buffer
    }
    return false
})
CKit.toBase64 = (!CKit.isServer && btoa.bind(window)) || ((data) => Buffer.from(data).toString("base64"))
CKit.fromBase64 = (!CKit.isServer && atob.bind(window)) || ((data) => Buffer.from(data, "base64").toString("binary"))
Object.defineProperty(CKit, "identifier", {value: CKit.toBase64(`vNetworkify-${(CKit.isServer && "Server") || "Client"}`), enumerable: true, configurable: false, writable: false})
CKit.version = Object.defineProperty(CKit, "version", {value: CKit.toBase64("3.3.1"), enumerable: true, configurable: false, writable: false})

// @Desc: Executes the specified handler
CKit.exec = (exec, ...cArgs) => {
    if (!CKit.isFunction(exec)) return false
    return exec(...cArgs)
}

// @Desc: Schedules the specified handler to be executed at desired interval
CKit.scheduleExec = (exec, duration, isInterval) => {
    if (!CKit.isFunction(exec)) return false
    return ((isInterval && setInterval) || setTimeout)(exec, duration)
}

// @Desc: Fetches an API
CKit.fetch = (!CKit.isServer && (async (route, options) => {
    try {
        const result = await fetch(route, options)
        return await result.text()
    }
    catch(error) {throw error}
})) || ((route, options) => {
    var resolve = false, reject = false
    const result = new Promise((__resolve, __reject) => {resolve = __resolve, reject = __reject})
    const request = CHTTPS.request(route, options, (response) => {
        let buffer = ""
        response.on("data", (chunk) => buffer += chunk.toString())
        response.on("end", () => resolve(buffer))
    })
    request.on("error", (error) => reject(error))
    request.end()
    return result
})

// @Desc: Creates dynamic whitelisted module APIs
CKit.createAPIs = (buffer, blacklist) => {
    if (!CKit.isObject(buffer) && !CKit.isClass(buffer)) return false
    blacklist = (blacklist && CKit.isObject(blacklist) && blacklist) || false
    var isVoid = true
    const result = {}
    for (const i in buffer) {
        const j = buffer[i]
        const isBlackListed = (blacklist && (blacklist[i] == true) && true) || false
        const isBlacklistPointer = (blacklist && !isBlackListed && blacklist[i]) || false
        if (!isBlackListed) {
            if (CKit.isObject(j) || CKit.isClass(j)) {
                const __result = CKit.createAPIs(j, isBlacklistPointer)
                if (__result) {
                    isVoid = false
                    result[i] = __result
                }
            }
            else if (CKit.isFunction(j)) {
                isVoid = false
                result[i] = j
            }
        }
    }
    return (!isVoid && result) || false
}


//////////////
// Exports //
//////////////

CKit.global.vKit = CKit
module.exports = CKit
require("./type")
require("./vid")
require("./network")
require("./room")