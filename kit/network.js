/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: network.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Network Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require(".")


/////////////////////
// Class: Network //
/////////////////////

const CNetwork = vKit.Class()
CNetwork.private.buffer = {}


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the network is void
CNetwork.public.addMethod("isVoid", (name) => (vKit.isString(name) && !CNetwork.private.buffer[name] && true) || false)

// @Desc: Fetches network instance by name
CNetwork.public.addMethod("fetch", (name) => (!CNetwork.public.isVoid(name) && CNetwork.private.buffer[name]) || false)

// @Desc: Creates a fresh network w/ specified name
CNetwork.public.addMethod("create", (name, ...cArgs) => {
    if (!CNetwork.public.isVoid(name)) return false
    CNetwork.private.buffer[name] = CNetwork.public.createInstance(name, ...cArgs)
    return CNetwork.private.buffer[name]
})

// @Desc: Destroys an existing network by specified name
CNetwork.public.addMethod("destroy", (name) => {
    if (CNetwork.public.isVoid(name)) return false
    return CNetwork.private.buffer[name].destroy()
})

// @Desc: Attaches a handler on specified network
CNetwork.public.addMethod("on", (name, ...cArgs) => {
    const cInstance = CNetwork.public.fetch(name)
    if (!cInstance) return false
    return cInstance.on(...cArgs)
})

// @Desc: Detaches a handler from specified network
CNetwork.public.addMethod("off", (name, ...cArgs) => {
    const cInstance = CNetwork.public.fetch(name)
    if (!cInstance) return false
    return cInstance.off(...cArgs)
})

// @Desc: Emits to all attached non-callback handlers of specified network
CNetwork.public.addMethod("emit", (name, ...cArgs) => {
    const cInstance = CNetwork.public.fetch(name)
    if (!cInstance) return false
    return cInstance.emit(...cArgs)
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CNetwork.public.addMethod("constructor", (self, name, isCallback) => {
    const private = CNetwork.instance.get(self)
    private.name = name
    private.isCallback = (vKit.isBool(isCallback) && true) || false
    self.isCallback = private.isCallback
    private.handler = (!private.isCallback && {}) || false
})

// @Desc: Destroys the instance
CNetwork.public.addInstanceMethod("destroy", (self) => {
    const private = CNetwork.instance.get(self)
    delete CNetwork.private.buffer[(private.name)]
    self.destroyInstance()
    return true
})

// @Desc: Attaches a handler on instance
CNetwork.public.addInstanceMethod("on", (self, exec) => {
    const private = CNetwork.instance.get(self)
    if (!vKit.isFunction(exec)) return false
    if (!private.isCallback) {
        const execVID = vKit.vid.fetch(exec)
        if (private.handler[execVID]) return false
        private.handler[execVID] = {exec: exec}
    }
    else {
        if (private.handler) return false
        private.handler = {exec: exec}
    }
    return true
})

// @Desc: Detaches a handler from instance
CNetwork.public.addInstanceMethod("off", (self, exec) => {
    const private = CNetwork.instance.get(self)
    if (!vKit.isFunction(exec)) return false
    if (!private.isCallback) {
        const execVID = vKit.vid.fetch(exec, null, true)
        if (!execVID || !private.handler[execVID]) return false
        delete private.handler[execVID]
    }
    else {
        if (!private.handler || (exec != private.handler.exec)) return false
        private.handler = false
    }
    return true
})

// @Desc: Emits to all attached non-callback handlers of instance
CNetwork.public.addInstanceMethod("emit", (self, ...cArgs) => {
    const private = CNetwork.instance.get(self)
    if (private.isCallback) return false
    for (const i in private.handler) {
        private.handler[i].exec(...cArgs)
    }
    return true
})

// @Desc: Emits to attached callback handler of instance
CNetwork.public.addInstanceMethod("emitCallback", async (self, ...cArgs) => {
    const private = CNetwork.instance.get(self)
    if (!private.isCallback || !private.handler) return false
    return await private.handler.exec(...cArgs)
})


//////////////
// Exports //
//////////////

module.exports = CNetwork.public