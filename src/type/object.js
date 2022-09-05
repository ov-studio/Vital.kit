/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type: object.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Object Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require("../")
const private = new WeakMap()


////////////////////
// Class: Object //
////////////////////

// @Desc: Creates a new object
vKit.Object = () => {
    const __R = [[], {}, [[], new WeakMap()]]
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
        length: () => __R[0].length
    }
    private.set(__I, {type: "object", ref: __R})
    return __I
}

// @Desc: Custom loop handlers
const forLoop = (__I, isOrdered, exec) => {
    if (!vKit.isObject(__I) || !vKit.isFunction(exec)) return false
    const isType = (private.has(__I) && private.get(__I)) || false
    if (!isType) return false
    if (isOrdered)  isType.ref[0].forEach((j, i) => exec(i, j))
    else {
        isType.ref[2][0].forEach((j, i) => exec(j, isType.ref[2][1].get(j)))
        for (const i in isType.ref[1]) {
            exec(i, isType.ref[1][i])
        }
    }
    return true
}
vKit.Object.forEach = (__I, exec) => forLoop(__I, true, exec)
vKit.Object.forAll = (__I, exec) => forLoop(__I, false, exec)

// @Desc: Native loop handlers (B.C)
const nativeLoop = (__I, exec) => {
    if (!vKit.isObject(__I) || !vKit.isFunction(exec)) return false
    for (const i in __I) {
        exec(i, __I[i])
    }
}
Object.defineProperty(Object.prototype, "forEach", {
    value: function(exec) {
        if (vKit.Object.forEach(this, exec)) return false
        else return nativeLoop(this, exec)
    },
    enumerable: false, configurable: false, writable: false
})
Object.defineProperty(Object.prototype, "forAll", {
    value: function(exec) {
        if (vKit.Object.forAll(this, exec)) return false
        else return nativeLoop(this, exec)
    },
    enumerable: false, configurable: false, writable: false
})
