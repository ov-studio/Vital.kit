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

// @Desc: Converts value to string
vKit.String = (value) => String(value)

// @Desc: Replaces matching values of string w/ specified value
vKit.String.gsub = (value, matchValue, replaceValue) => {
    const vType = typoef(value)
    const isNum = vType == "number"
    if (!isNum && (vType != "string")) return false
    value = value.replace(vKit.String(matchValue), vKit.String(replaceValue))
    if (isNum) value = vKit.Number(value)
    return value
}