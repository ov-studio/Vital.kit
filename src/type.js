/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Type Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require(".")


//////////////////
// Class: Type //
//////////////////

const CType = [
    {handler: "isBool", type: "boolean"},
    {handler: "isString", type: "string"},
    {handler: "isNumber", type: "number"},
    {handler: "isObject", type: "object", middleware: ((data, isArray) => (!isArray && true) || Array.isArray(data))},
    {handler: "isFunction", type: "function"}
], CCache = new WeakMap()
CType.forEach((j) => {
    vKit[(j.handler)] = (data, ...cArgs) => {
        var isValid = vKit.isType(data, j.type)
        if (isValid && j.middleware) isValid = (j.middleware(data, ...cArgs) && isValid) || false
        return isValid
    }
})

// @Desc: Verifies whether specified data is null
vKit.isNull = (data) => data == null

// @Desc: Verifies specified data's type
vKit.isType = (data, type) => (!vKit.isNull(data) && !vKit.isNull(type) && (typeof(type) == "string") && (typeof(data) == type) && true) || false

// @Desc: Verifies whether specified data is an array
vKit.isArray = (data) => vKit.isObject(data, true)

// @Desc: Verifies whether specified data is a class
vKit.isClass = (data) => {
    const isType = (CCache.has(data) && CCache.get(data)) || false
    return (isType && (isType.type == "class") && true) || false
}

vKit.cloneObject = (parent, isRecursive) => {
    if (!vKit.isObject(parent)) return false
    const result = {}
    for (const i in parent) {
        const j = parent[i]
        if (isRecursive && vKit.isObject(j)) result[i] = vKit.cloneObject(j, isRecursive)
        else result[i] = j
    }
    return result
}

// @Desc: Creates a new dynamic object
vKit.Object = () => {
    const __R = [[], {}, new WeakMap()]
    const __I = {
        set: (property, value) => {
            const pType = typeof(property)
            if (pType == "number") {
                __R[0][property] = value
                return true
            }
            else if (pType == "object") {
                __R[2].set(property, value)
                return true
            }
            else {
                __R[1][property] = value
                return true
            }
        },
        get: (property) => {
            const pType = typeof(property)
            if (pType == "number") return __R[0][property]
            else if (pType == "object") return __R[2].get(property)
            else return __R[1][property]
        }
    }
    CCache.set(__I, {type: "object", ref: __R})
    return __I
}

// @Desc: Creates a new dynamic class
vKit.Class = (parent) => {
    const __I = new WeakMap()
    class __C {
        constructor(...cArgs) {
            __I.set(this, {})
            vKit.exec(__C.constructor, this, ...cArgs)
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
    CCache.set(__C, {type: "class", ref: __C})
    return {public: __C, private: {}, instance: __I}
}