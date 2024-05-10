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
    load: eval,
    print: (rw) => console.log(`\x1b[2m\x1b[37m[${vKit.timestamp(true)}] ━│ \x1b[0m\x1b[33m${rw}`),
    query: require("querystring")
}
Object.defineProperty(vKit, "server", {value: ((typeof(process) != "undefined") && !process.browser && true) || false, enumerable: true, configurable: false, writable: false})
Object.defineProperty(vKit, "global", {value: (vKit.server && global) || window, enumerable: true, configurable: false, writable: false})
vKit.crypto = (vKit.server && require("crypto")) || crypto
vKit.toBase64 = (!vKit.server && btoa.bind(window)) || ((data) => Buffer.from(data).toString("base64"))
vKit.fromBase64 = (!vKit.server && atob.bind(window)) || ((data) => Buffer.from(data, "base64").toString("binary"))
Object.defineProperty(vKit, "identifier", {value: vKit.toBase64(`vNetworkify-${(vKit.server && "Server") || "Client"}`), enumerable: true, configurable: false, writable: false})
Object.defineProperty(vKit, "version", {value: vKit.toBase64(require("../package.json").version), enumerable: true, configurable: false, writable: false})
vKit.crypto.getRandomValues = vKit.crypto.getRandomValues || ((buffer) => {
    if (buffer instanceof Uint8Array) {
        buffer.set(vKit.crypto.randomBytes(buffer.length))
        return buffer
    }
    return false
})

// @Desc: Retrieves current timestamp
vKit.timestamp = (isFormat) => {
    let now = new Date()
    now = {
        day: String(now.getDate()).padStart(2, "0"),
        month: String(now.getMonth()).padStart(2, "0"),
        year: String(now.getFullYear()).padStart(4, "0"),
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(now.getMinutes()).padStart(2, "0"),
        seconds: String(now.getSeconds()).padStart(2, "0")
    }
    return (isFormat && `${now.year}/${now.month}/${now.day} ━ ${now.hours}:${now.minutes}:${now.seconds}`) || now
}

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
vKit.fetch = (!vKit.server && (async (route, options) => {
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
    "http": false,
    "https": false
}
module.exports = vKit
require("./type")
require("./vid")
require("./vcl")