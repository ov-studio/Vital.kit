/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Type Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CKit = require(".")


//////////////////
// Class: Type //
//////////////////

const CCache = new WeakMap()
const CType = [
    {handler: "isBool", type: "boolean"},
    {handler: "isString", type: "string"},
    {handler: "isNumber", type: "number"},
    {handler: "isObject", type: "object", middleware: ((data, isArray) => (!isArray && true) || Array.isArray(data))},
    {handler: "isFunction", type: "function"}
]
CType.forEach((j) => {
    CKit[(j.handler)] = (data, ...cArgs) => {
        var isValid = CKit.isType(data, j.type)
        if (isValid && j.middleware) isValid = (j.middleware(data, ...cArgs) && isValid) || false
        return isValid
    }
})

// @Desc: Verifies whether specified data is null
CKit.isNull = (data) => data == null

// @Desc: Verifies specified data's type
CKit.isType = (data, type) => (!CKit.isNull(data) && !CKit.isNull(type) && (typeof(type) == "string") && (typeof(data) == type) && true) || false

// @Desc: Verifies whether specified data is an array
CKit.isArray = (data) => CKit.isObject(data, true)

// @Desc: Verifies whether specified data is a class
CKit.isClass = (data) => {
    const isType = (CCache.has(data) && CCache.get(data)) || false
    return (isType && (isType.type == "class") && true) || false
}

CKit.cloneObject = (parent, isRecursive) => {
    if (!CKit.isObject(parent)) return false
    const result = {}
    for (const i in parent) {
        const j = parent[i]
        if (isRecursive && CKit.isObject(j)) result[i] = CKit.cloneObject(j, isRecursive)
        else result[i] = j
    }
    return result
}

// @Desc: Creates a new dynamic object
CKit.Object = () => {
    const __R = [[], {}, new WeakMap()]
    const __I = {
        set: (property, value) => {
            const propType = typeof(property)
            if (propType == "number") {
                __R[0][property] = value
                return true
            }
            else if (propType == "object") {
                __R[2].set(property, value)
                return true
            }
            else {
                __R[1][property] = value
                return true
            }
        },
        get: (property) => {
            const propType = typeof(property)
            if (propType == "number") return __R[0][property]
            else if (propType == "object") return __R[2].get(property)
            else return __R[1][property]
        }
    }
    CCache.set(__I, {type: "object", ref: __R})
    return __I
}

// @Desc: Creates a new dynamic class
CKit.Class = (parent) => {
    const __I = new WeakMap()
    class __C {
        constructor(...cArgs) {
            __I.set(this, {})
            CKit.exec(__C.constructor, this, ...cArgs)
        }
    }
    CCache.set(__C, {type: "class", ref: __C})
    if (CKit.isObject(parent)) {
        for (const i in parent) {
            __C[i] = parent[i]
        }
    }
    __C.addMethod = (index, exec, isInstanceware) => {
        if (!CKit.isString(index) || !CKit.isFunction(exec)) return false
        if ((index == "constructor") && CKit.isString(isInstanceware)) __C.isInstanceware = isInstanceware
        __C[index] = exec
        return true
    }
    __C.removeMethod = (index) => {
        if (!CKit.isString(index) || !CKit.isFunction(__C[index])) return false
        delete __C[index]
        return true
    }
    __C.addInstanceMethod = (index, exec) => {
        if (!CKit.isString(index) || !CKit.isFunction(exec)) return false
        __C.prototype[index] = function(...cArgs) {
            const self = this
            const isInstanceware = __C.isInstanceware
            if (!__I.has(self) || (CKit.isString(isInstanceware) && (index != isInstanceware) && CKit.isFunction(self[isInstanceware]) && !self[isInstanceware]())) return false
            return exec(self, ...cArgs)
        }
        return true
    }
    __C.removeInstanceMethod = (index) => {
        if (!CKit.isString(index) || !CKit.isFunction(__C.prototype[index])) return false
        delete __C.prototype[index]
        return true
    }
    __C.createInstance = (...cArgs) => new __C(...cArgs)
    __C.addInstanceMethod("isInstance", (self) => __I.has(self))
    __C.addInstanceMethod("destroyInstance", (self) => __I.delete(self))
    return {public: __C, private: {}, instance: __I}
}