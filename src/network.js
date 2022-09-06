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

const CNetwork = vKit.Buffer("network")
module.exports = CNetwork.public


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a fresh network w/ specified name
CNetwork.public.addMethod("create", (name, ...cArgs) => {
    if (!CNetwork.public.isVoid(name)) return false
    const cInstance = CNetwork.public.createInstance(name, ...cArgs)
    CNetwork.private.buffer.set(name, cInstance)
    return cInstance
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
    private.handler = (!private.isCallback && vKit.Object()) || false
})

// @Desc: Attaches a handler on instance
CNetwork.public.addInstanceMethod("on", (self, exec) => {
    const private = CNetwork.instance.get(self)
    if (!vKit.isFunction(exec)) return false
    if (!private.isCallback) {
        if (private.handler.get(exec)) return false
        private.handler.set(exec, true)
    }
    else {
        if (private.handler) return false
        private.handler = exec
    }
    return true
})

// @Desc: Detaches a handler from instance
CNetwork.public.addInstanceMethod("off", (self, exec) => {
    const private = CNetwork.instance.get(self)
    if (!vKit.isFunction(exec)) return false
    if (!private.isCallback) {
        if (!private.handler.get(exec)) return false
        private.handler.delete(exec)
    }
    else {
        if (!private.handler || (exec != private.handler)) return false
        private.handler = false
    }
    return true
})

// @Desc: Emits to all attached non-callback handlers of instance
CNetwork.public.addInstanceMethod("emit", (self, ...cArgs) => {
    const private = CNetwork.instance.get(self)
    if (private.isCallback) return false
    private.handler.forAll((i) => i(...cArgs))
    return true
})

// @Desc: Emits to attached callback handler of instance
CNetwork.public.addInstanceMethod("emitCallback", async (self, ...cArgs) => {
    const private = CNetwork.instance.get(self)
    if (!private.isCallback || !private.handler) return false
    return await private.handler(...cArgs)
})