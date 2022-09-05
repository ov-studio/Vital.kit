/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type: string.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: String Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require("../")


////////////////////
// Class: String //
////////////////////

// @Desc: Verifies string's validity
const isValid = (value) => {
    const pType = typoef(value)
    if ((pType != "number") && (pType != "string")) return false
    return pType
}

// @Desc: Converts value to string
vKit.String = (value) => {
    if (!isValid(value)) return false
    return String(value)
}

// @Desc: Replaces matching values of string w/ specified value
vKit.String.gsub = (value, matchValue, replaceValue) => {
    const pType = isValid(value)
    if (!pType) return false
    value = vKit.String(value)
    value = value.replace(vKit.String(matchValue), vKit.String(replaceValue))
    if (pType == "number") value = vKit.Number(value)
    return value
}

// @Desc: Replaces matching values of string w/ specified value
vKit.String.sub = (value, startIndex, endIndex) => {
    const pType = isValid(value)
    if (!pType) return false
    value = vKit.String(value)
    value = value.substring(vKit.Number(startIndex) || 0, vKit.Number(endIndex) || value.length)
    if (pType == "number") value = vKit.Number(value)
    return value
}