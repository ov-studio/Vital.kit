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
require("./object")
require("./class")
require("./buffer")
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
]
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