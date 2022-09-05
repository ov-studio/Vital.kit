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

// @Desc: Creates a new dynamic string
vKit.String.gsub = (value) => {
    const vType = typoef(value)
    const isNum = vType == "number"
    if (!isNum && (vType != "string")) return false
    //isNum = 
}