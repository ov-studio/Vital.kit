/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: vcl.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: VCL Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require(".")


/////////////////
// Class: VCL //
/////////////////

const CVCL = vNetworkify.util.createClass()
vKit.vcl = CVCL.public
CVCL.private.types = {
    init: ":",
    comment: "#",
    tab: "\t",
    space: " ",
    newline: "\n",
    carriageline: "\r",
    list: "-",
    negative: "-",
    decimal: ".",
    bool: {
        ["true"]: "true",
        ["false"]: "false"
    },
    string: {
        ["`"]: true,
        ["'"]: true,
        ["\""]: true
    }
}


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether rw is void
CVCL.private.isVoid = (rw) => {
    rw = ((typeof(rw) == "number") && String(rw)) || rw
    return (!rw.match(/[\w]/g) && true) || false
}

// @Desc: Fetches rw by index
CVCL.private.fetch = (rw, index) => {
    return rw.substring(index, index + 1)
}

// @Desc: Fetches rw's line by index
CVCL.private.fetchLine = (rw, index) => {
    if (rw) {
        const rwLines = rw.substring(0, index).split(CVCL.private.types.newline)
        return [Math.max(1, rwLines.length), rwLines[(rwLines.length - 1)] || ""]
    }
    return false
}

// @Desc: Parses comment
CVCL.private.parseComment = (parser, buffer, rw) => {
    if (!parser.isType && (rw == CVCL.private.types.comment)) {
        const [line, lineText] = CVCL.private.fetchLine(buffer.substring(0, parser.ref))
        const rwLines = buffer.split(CVCL.private.types.newline)
        parser.ref = parser.ref - lineText.length + rwLines[(line - 1)].length
    }
    return true
}

// @Desc: Parses boolean
CVCL.private.parseBoolean = (parser, buffer, rw) => {
    if (!parser.isType || (parser.isType == "bool")) {
        if (!parser.isType) {
            for (const i in CVCL.private.types.bool) {
                if (buffer.substring(parser.ref, parser.ref + i.length) == i) {
                    rw = i
                    break
                }
            }
        }
        if (!parser.isType && CVCL.private.types.bool[rw]) {
            parser.isSkipAppend = true, parser.ref = parser.ref + rw.length - 1, parser.isType = "bool", parser.value = rw
        }
        else if (parser.isType) {
            if (rw == CVCL.private.types.newline) parser.isSkipAppend = true, parser.isParsed = true
            else return false
        }
    }
    return true
}

// @Desc: Parses number
CVCL.private.parseNumber = (parser, buffer, rw) => {
    if (!parser.isType || (parser.isType == "number")) {
        const isNumber = Number(rw)
        if (!parser.isType) {
            const isNegative = rw == CVCL.private.types.negative
            if (isNegative || isNumber) parser.isType = "number", parser.isTypeNegative = (isNegative && parser.ref) || false
        }
        else {
            if (rw == CVCL.private.types.decimal) {
                if (!parser.isTypeFloat) parser.isTypeFloat = true
                else return false
            }
            else if (!parser.isTypeFloat && parser.isTypeNegative && ((CVCL.private.isVoid(parser.index) && (rw == CVCL.private.types.space)) || (rw == CVCL.private.types.init))) {
                parser.ref = parser.isTypeNegative - 1, parser.index = "", parser.isType = "object", parser.isTypeFloat = false, parser.isTypeNegative = false
            }
            else if (rw == CVCL.private.types.newline) parser.isParsed = true
            else if (!isNumber) return false
        }
    }
    return true
}

// @Desc: Parses string
CVCL.private.parseString = (parser, buffer, rw) => {
    if (!parser.isType || (parser.isType == "string")) {
        if ((!parser.isTypeChar && CVCL.private.types.string[rw]) || parser.isTypeChar) {
            if (!parser.isType) parser.isSkipAppend = true, parser.isType = "string", parser.isTypeChar = rw
            else if (rw == parser.isTypeChar) {
                if (!parser.isTypeParsed) parser.isSkipAppend = true, parser.isTypeParsed = true
                else return false
            }
            else if (parser.isTypeParsed) {
                if (rw == CVCL.private.types.newline) parser.isParsed = true
                else return false
            }
        }
    }
    return true
}

// @Desc: Parses object
CVCL.private.parseObject = (parser, buffer, rw, isChild) => {
    if (parser.isType == "object") {
        if (CVCL.private.isVoid(parser.index) && (rw == CVCL.private.types.list)) parser.isTypeID = parser.ref
        else if (!CVCL.private.isVoid(rw)) parser.index = parser.index + rw
        else {
            if (parser.isTypeID && CVCL.private.isVoid(parser.index) && (rw == CVCL.private.types.init)) {
                // TODO: FIND AUTO INDEX
                console.log("FIND INDEX..")
                parser.index = String(parser.pointer.length + 1)
            }
            if (!CVCL.private.isVoid(parser.index)) {
                if (parser.isTypeID && (rw == CVCL.private.types.newline)) parser.pointer[(parser.pointer.length + 1)] = parser.index
                else if (rw == CVCL.private.types.init) {
                    const [line, lineText] = CVCL.private.fetchLine(buffer.substring(0, parser.ref))
                    const indexTypePadding = (parser.isTypeID && (parser.ref - parser.isTypeID - 1)) || 0
                    const indexPadding = lineText.length - parser.index.length - indexTypePadding - 1
                    if (isChild) {
                        parser.padding = parser.padding || indexPadding - 1
                        if (indexPadding <= parser.padding) {
                            parser.ref = parser.ref - parser.index.length - indexTypePadding
                            return false
                        }
                    }
                    if (parser.isTypeID) parser.isTypeID = false, parser.index = Number(parser.index)
                    if (!CVCL.private.isVoid(parser.index)) {
                        const [value, __index, error] = CVCL.private.decode(buffer, parser.ref + 1, indexPadding, true)
                        if (!error) {
                            parser.pointer[(parser.index)] = value, parser.ref = __index - 1, parser.index = ""
                        }
                        else parser.isChildErrored = 1
                    }
                    else parser.isChildErrored = 0
                }
                else parser.isChildErrored = 0
            }
            if (parser.isChildErrored) return false
        }
    }
    return true
}

CVCL.private.parseReturn = (parser, buffer) => {
    parser.isParsed = (!parser.isChildErrored && ((parser.isType == "object") || parser.isParsed) && true) || false
    if (!parser.isParsed) {
        if (!parser.isChildErrored || (parser.isChildErrored == 0)) {
            parser.isErrored = vNetworkify.util.string.format(parser.isErrored, CVCL.private.fetchLine(buffer, parser.ref), (parser.isType && "Malformed " + parser.isType) || "Invalid declaration")
            vNetworkify.util.print(parser.isErrored)
        }
        return [false, false, true]
    }
    else if (parser.isType == "object") return [parser.pointer, parser.ref]
    else if (parser.isType == "bool") return [((parser.value == "true") && true) || false, parser.ref]
    else return [((parser.isType == "number" && Number(parser.value)) || parser.value), parser.ref]
}

/*
function CVCL.private.encode(buffer, padding)
    if !buffer || (imports.type(buffer) != "table") then return false end
    padding = padding || ""
    local result, indexes = "", {numeric = {}, index = {}}
    for i, j in imports.pairs(buffer) do
        if imports.type(j) == "table" then
            table.insert(((imports.type(i) == "number") && indexes.numeric) || indexes.index, i)
        else
            i = ((imports.type(i) == "number") && "- "..String(i)) || i
            if imports.type(j) == "string" then j = "\""..j.."\"" end
            result = result..CVCL.private.types.newline..padding..i..CVCL.private.types.init..CVCL.private.types.space..String(j)
        end
    end
    table.sort(indexes.numeric, function(a, b) return a < b end)
    for i = 1, #indexes.numeric, 1 do
        local j = indexes.numeric[i]
        result = result..CVCL.private.types.newline..padding..CVCL.private.types.list..CVCL.private.types.space..j..CVCL.private.types.init..CVCL.private.encode(buffer[j], padding..CVCL.private.types.tab)
    end
    for i = 1, #indexes.index, 1 do
        local j = indexes.index[i]
        result = result..CVCL.private.types.newline..padding..j..CVCL.private.types.init..CVCL.private.encode(buffer[j], padding..CVCL.private.types.tab)
    end
    return result
end
CVCL.public.encode = (buffer) => {return CVCL.private.encode(buffer)}
*/

CVCL.private.decode = (buffer, ref, padding, isChild) => {
    if (!buffer || (typeof(buffer) != "string")) return false
    if (vNetworkify.util.string.isVoid(buffer)) return {} //TODO: ...
    const parser = {
        ref: ref || 1, padding: padding,
        index: "", pointer: {}, value: "",
        isErrored: "Failed to decode vcl. [Line: %s] [Reason: %s]"
    }
    if (!isChild) {
        buffer = vNetworkify.util.string.detab(buffer).replace(CVCL.private.types.carriageline, "")
        buffer = (!isChild && (CVCL.private.fetch(buffer, buffer.length) != CVCL.private.types.newline) && (buffer + CVCL.private.types.newline)) || buffer   
    }
    while(parser.ref <= buffer.length) {
        CVCL.private.parseComment(parser, buffer, CVCL.private.fetch(buffer, parser.ref))
        if (isChild) {
            parser.isSkipAppend = false
            if (!CVCL.private.parseBoolean(parser, buffer, CVCL.private.fetch(buffer, parser.ref))) break
            if (!CVCL.private.parseNumber(parser, buffer, CVCL.private.fetch(buffer, parser.ref))) break
            if (!CVCL.private.parseString(parser, buffer, CVCL.private.fetch(buffer, parser.ref))) break
            if (parser.isType && !parser.isSkipAppend && !parser.isParsed) parser.value = parser.value + CVCL.private.fetch(buffer, parser.ref)
        }
        parser.isType = (!parser.isType && ((CVCL.private.fetch(buffer, parser.ref) == CVCL.private.types.list) || !CVCL.private.isVoid(CVCL.private.fetch(buffer, parser.ref))) && "object") || parser.isType
        if (!CVCL.private.parseObject(parser, buffer, CVCL.private.fetch(buffer, parser.ref), isChild)) break
        if (isChild && !parser.isChildErrored && parser.isParsed) break
        parser.ref = parser.ref + 1
    }
    return CVCL.private.parseReturn(parser, buffer)
}
CVCL.public.decode = (buffer) => {
    const result = CVCL.private.decode(buffer)
    return result[0]
}


var test = `
A: true
B: "X"
-1: "test"
-2: "test"
1: "override"
-: "Hey"
`
//console.log(test)
const decodedText = CVCL.public.decode(test)
//console.log(decodedText)
//console.log(decodedText[1])


vObject = () => {
    const vRefs = [[], {}, new WeakMap()]
    return {
        set: (property, value) => {
            const propType = typeof(property)
            if (propType == "number") {
                vRefs[0][property] = value
                return true
            }
            else if (propType == "object") {
                vRefs[2].set(property, value)
                return true
            }
            else {
                vRefs[1][property] = value
                return true
            }
        },
        get: (property) => {
            const propType = typeof(property)
            if (propType == "number") return vRefs[0][property]
            else if (propType == "object") return vRefs[2].get(property)
            else return vRefs[1][property]
        }
    }
}


const cObject = vObject()
const testValue = {}
cObject.set(1, "This is int")
cObject.set("1", "This is string")
cObject.set(testValue, "yep")

console.log(cObject.get(1))
console.log(cObject.get("1"))
console.log(cObject.get(testValue))


//vRefs[1].set(1, "valueA")
//vRefs[1].set("1", "valueA")

//console.log(vRefs[1].get(1))
/*
console.log(vRefs[1][1])
console.log(vRefs[1][2])

vRefs[1].forEach(function(value, index) {
    console.log(index + " : " + value)
})
*/