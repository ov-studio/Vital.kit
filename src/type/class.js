/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type: class.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Class Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require("../")
const private = new WeakMap()


///////////////////
// Class: Class //
///////////////////

// @Desc: Verifies whether specified data is a class
vKit.isClass = (data) => {
    const isType = (private.has(data) && private.get(data)) || false
    return (isType && (isType.type == "class") && true) || false
}

// @Desc: Creates a new class
vKit.Class = (parent) => {
    const __I = new WeakMap()
    class __C {
        constructor(...cArgs) {
            __I.set(this, {})
            if (__C.isInstanceware) vKit.exec(__C.constructor, this, ...cArgs)
        }
    }
    if (vKit.isObject(parent)) {
        for (const i in parent) {
            __C[i] = parent[i]
        }
    }
    __C.addMethod = (index, exec, isInstanceware) => {
        if (!vKit.isString(index) || !vKit.isFunction(exec)) return false
        if ((index == "constructor") && vKit.isString(isInstanceware)) __C.isInstanceware = isInstanceware
        __C[index] = exec
        return true
    }
    __C.removeMethod = (index) => {
        if (!vKit.isString(index) || !vKit.isFunction(__C[index])) return false
        delete __C[index]
        return true
    }
    __C.addInstanceMethod = (index, exec) => {
        if (!vKit.isString(index) || !vKit.isFunction(exec)) return false
        __C.prototype[index] = function(...cArgs) {
            const self = this
            const isInstanceware = __C.isInstanceware
            if (!__I.has(self) || (vKit.isString(isInstanceware) && (index != isInstanceware) && vKit.isFunction(self[isInstanceware]) && !self[isInstanceware]())) return false
            return exec(self, ...cArgs)
        }
        return true
    }
    __C.removeInstanceMethod = (index) => {
        if (!vKit.isString(index) || !vKit.isFunction(__C.prototype[index])) return false
        delete __C.prototype[index]
        return true
    }
    __C.createInstance = (...cArgs) => new __C(...cArgs)
    __C.addInstanceMethod("isInstance", (self) => __I.has(self))
    __C.addInstanceMethod("destroyInstance", (self) => __I.delete(self))
    private.set(__C, {type: "class", ref: __C})
    return {public: __C, private: {}, instance: __I}
}