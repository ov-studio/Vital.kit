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

const vKit = require("..")
const private = new WeakMap()


////////////////////
// Class: Object //
////////////////////

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
    }
    private.set(__I, {type: "object", ref: __R})
    return __I
}

vKit.Object.forAll = (__I) => {
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

Object.defineProperty(Object.prototype, "forAll", {
    value: function(exec) {
        if (!vKit.isFunction(exec) || vKit.Object.forAll(this)) return false
        for (const i in this) {
            exec(i, this[i])
        }
    },
    enumerable: true, configurable: false, writable: false
})
