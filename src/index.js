/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Utility Initializer
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CHTTPS = require("https")


//////////////////
// Class: vKit //
//////////////////

const vKit = {
    ignore: {},
    print: console.log,
    load: eval,
    query: require("querystring")
}
Object.defineProperty(vKit, "isServer", {value: ((typeof(process) != "undefined") && !process.browser && true) || false, enumerable: true, configurable: false, writable: false})
Object.defineProperty(vKit, "global", {value: (vKit.isServer && global) || window, enumerable: true, configurable: false, writable: false})
vKit.crypto = (vKit.isServer && require("crypto")) || crypto
vKit.crypto.getRandomValues = vKit.crypto.getRandomValues || ((buffer) => {
    if (buffer instanceof Uint8Array) {
        buffer.set(vKit.crypto.randomBytes(buffer.length))
        return buffer
    }
    return false
})
vKit.toBase64 = (!vKit.isServer && btoa.bind(window)) || ((data) => Buffer.from(data).toString("base64"))
vKit.fromBase64 = (!vKit.isServer && atob.bind(window)) || ((data) => Buffer.from(data, "base64").toString("binary"))
Object.defineProperty(vKit, "identifier", {value: vKit.toBase64(`vNetworkify-${(vKit.isServer && "Server") || "Client"}`), enumerable: true, configurable: false, writable: false})
Object.defineProperty(vKit, "version", {value: vKit.toBase64(require("../package.json").version), enumerable: true, configurable: false, writable: false})

// @Desc: Executes the specified handler
vKit.exec = (exec, ...cArgs) => {
    if (!vKit.isFunction(exec)) return false
    return exec(...cArgs)
}

// @Desc: Schedules the specified handler to be executed at desired interval
vKit.scheduleExec = (exec, duration, isInterval) => {
    if (!vKit.isFunction(exec)) return false
    return ((isInterval && setInterval) || setTimeout)(exec, duration)
}

// @Desc: Fetches an API
vKit.fetch = (!vKit.isServer && (async (route, options) => {
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
vKit.createAPIs = (buffer, blacklist) => {
    if (!vKit.isObject(buffer) && !vKit.isClass(buffer)) return false
    blacklist = (blacklist && vKit.isObject(blacklist) && blacklist) || false
    var isVoid = true
    const result = {}
    for (const i in buffer) {
        const j = buffer[i]
        const isBlackListed = (blacklist && (blacklist[i] == true) && true) || false
        const isBlacklistPointer = (blacklist && !isBlackListed && blacklist[i]) || false
        if (!isBlackListed) {
            if (vKit.isObject(j) || vKit.isClass(j)) {
                const __result = vKit.createAPIs(j, isBlacklistPointer)
                if (__result) {
                    isVoid = false
                    result[i] = __result
                }
            }
            else if (vKit.isFunction(j)) {
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

vKit.global.vKit = vKit
vKit.ignore.web = {
    "querystring": false,
    "crypto": false,
    "https": false
}
module.exports = vKit
require("./type")
require("./vid")
require("./vcl")