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

// @Desc: Verifies whether the string is void
vKit.String.isVoid = (value) => {
    return (!vKit.String.match(vKit.String.replace(/[\n\r\t\s]/g, ""), /[\W\w]/g) && true) || false
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

// @Desc: Replaces matching values of string w/ specified value
vKit.String.replace = (value, matchValue, replaceValue) => {
    const pType = isValid(value)
    if (!pType || !vKit.isString(matchValue) || !vKit.isString(replaceValue)) return false
    value = vKit.String(value)
    value = value.replace(matchValue, replaceValue)
    if (pType == "number") value = vKit.Number(value)
    return value
}

// @Desc: Retrieves matching values of string
vKit.String.match = (value, matchValue) => {
    if (!isValid(value) || !vKit.isString(matchValue)) return false
    return vKit.String(value).match(matchValue)
}

// @Desc: Splits string using specified separator
vKit.String.split = (value, separator) => {
    if (!isValid(value) || !vKit.isString(separator)) return false
    return vKit.String(value).split(value, separator)
}

// @Desc: Converts tabs of provided string to spaces
vKit.String.detab = (value) => vKit.String.replace(value, "\t", "    ")