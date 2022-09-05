/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Type Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require("../")
require("./string")
require("./math")


//////////////////
// Class: Type //
//////////////////

const CType = [
    {handler: "isBool", type: "boolean"},
    {handler: "isString", type: "string"},
    {handler: "isNumber", type: "number"},
    {handler: "isObject", type: "object", middleware: ((data, isArray) => (!isArray && true) || Array.isArray(data))},
    {handler: "isFunction", type: "function"}
], CCache = new WeakMap(), CBuffer = {}
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

// @Desc: Clones specified parent
vKit.clone = (parent, isRecursive) => {
    if (!vKit.isObject(parent)) return parent
    const result = {}
    for (const i in parent) {
        const j = parent[i]
        if (isRecursive && vKit.isObject(j)) result[i] = vKit.clone(j, isRecursive)
        else result[i] = j
    }
    return result
}

// @Desc: Creates a new dynamic object
vKit.Object = () => {
    const __R = [[], {}, [[], new WeakMap()]]
    const __L = (exec, isOrdered) => {
        if (!vKit.isFunction(exec)) return false
        if (isOrdered)  __R[0].forEach((j, i) => exec(i, j))
        else {
            __R[2][0].forEach((j, i) => exec(j, __R[2][1].get(j)))
            for (const i in __R[1]) {
                exec(i, __R[1][i])
            }
        }
        return true
    }
    const __I = {
        set: (property, value) => {
            const pType = typeof(property)
            if (pType == "number") {
                __R[0][property] = value
                return true
            }
            else if (pType == "object") {
                let pIndex = __R[2][0].indexOf(property)
                if (pIndex == -1) pIndex = __R[2][0].length
                __R[2][0][pIndex] = property
                __R[2][1].set(property, value)
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
            else if (pType == "object") return __R[2][1].get(property)
            else return __R[1][property]
        },
        delete: (property) => {
            const pType = typeof(property)
            if (pType == "number") {
                delete __R[0][property]
                return true
            }
            else if (pType == "object") {
                let pIndex = __R[2][0].indexOf(property)
                if (pIndex != -1) delete __R[2][0][pIndex]
                __R[2][1].delete(property)
                return true
            }
            else {
                delete __R[1][property]
                return true
            }
        },
        length: () => __R[0].length,
        forEach: (exec) => __L(exec, true) || false,
        forAll: (exec) => (__L(exec) && __L(exec, true)) || false
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

// @Desc: Creates a new dynamic buffer
vKit.Buffer = (category) => {
    if (!vKit.isString(category)) return false
    if (!CBuffer[category]) {
        CBuffer[category] = vKit.Class()
        CBuffer[category].private.buffer = vKit.Object()
        CBuffer[category].public.addMethod("isVoid", (ref) => (vKit.isString(ref) && !CBuffer[category].private.buffer.get(ref) && true) || false)
        CBuffer[category].public.addMethod("fetch", (ref) => (!CBuffer[category].public.isVoid(ref) && CBuffer[category].private.buffer.get(ref)) || false)
        CBuffer[category].public.addMethod("create", (ref) => {
            if (!CBuffer[category].public.isVoid(ref)) return false
            return CBuffer[category].public.createInstance(ref)
        })
        CBuffer[category].public.addMethod("destroy", (ref) => {
            if (CBuffer[category].public.isVoid(ref)) return false
            return CBuffer[category].private.buffer.get(ref).destroy()
        })
        CBuffer[category].public.addMethod("constructor", (self, ref) => {
            const private = CBuffer[category].instance.get(self)
            private.ref = ref
        })
        CBuffer[category].public.addInstanceMethod("destroy", (self) => {
            const private = CBuffer[category].instance.get(self)
            CBuffer[category].private.buffer.delete(private.ref)
            self.destroyInstance()
            return true
        })
    }
    return CBuffer[category].public
}