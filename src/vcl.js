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

const CVCL = vKit.Class()
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
CVCL.private.isVoid = (rw) => (!vKit.String.match(rw, "[\\w]") && true) || false

// @Desc: Fetches rw by index
CVCL.private.fetch = (rw, index) => vKit.String.sub(rw, index, index + 1)

// @Desc: Fetches rw's line by index
CVCL.private.fetchLine = (rw, index) => {
    if (rw) {
        const rwLines = vKit.String.sub(rw, 0, index).split(CVCL.private.types.newline)
        return [Math.max(1, rwLines.length), rwLines[(rwLines.length - 1)] || ""]
    }
    return false
}

// @Desc: Parses comment
CVCL.private.parseComment = (parser, buffer, rw) => {
    if (!parser.isType && (rw == CVCL.private.types.comment)) {
        const [line, lineText] = CVCL.private.fetchLine(vKit.String.sub(buffer, 0, parser.ref))
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
                if (vKit.String.sub(buffer, parser.ref, parser.ref + i.length) == i) {
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
        var isNumber = Number(rw)
        if (isNumber && isNumber.isNaN()) isNumber = false 
        if (!parser.isType) {
            const isNegative = rw == CVCL.private.types.negative
            if (isNegative || !vKit.isBool(isNumber)) parser.isType = "number", parser.isTypeNegative = (isNegative && parser.ref) || false
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
            else if (vKit.isBool(isNumber)) return false
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
            if (parser.isTypeID && CVCL.private.isVoid(parser.index) && (rw == CVCL.private.types.init)) parser.index = String(parser.pointer.length() + 1)
            if (!CVCL.private.isVoid(parser.index)) {
                if (parser.isTypeID && (rw == CVCL.private.types.newline)) parser.pointer.set(parser.pointer.length() + 1, parser.index)
                else if (rw == CVCL.private.types.init) {
                    const [line, lineText] = CVCL.private.fetchLine(vKit.String.sub(buffer, 0, parser.ref))
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
                            parser.pointer.set(parser.index, value)
                            parser.ref = __index - 1, parser.index = ""
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
            parser.isErrored = vKit.string.format(parser.isErrored, CVCL.private.fetchLine(buffer, parser.ref), (parser.isType && "Malformed " + parser.isType) || "Invalid declaration")
            vKit.print(parser.isErrored)
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
CVCL.public.encode = (buffer) => CVCL.private.encode(buffer)
*/

CVCL.private.decode = (buffer, ref, padding, isChild) => {
    if (!buffer || (typeof(buffer) != "string")) return false
    if (vKit.String.isVoid(buffer)) return []
    const parser = {
        ref: ref || 1, padding: padding,
        index: "", pointer: vKit.Object(), value: "",
        isErrored: "Failed to decode vcl. [Line: %s] [Reason: %s]"
    }
    if (!isChild) {
        buffer = vKit.String.detab(buffer).replace(CVCL.private.types.carriageline, "")
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
CVCL.public.decode = (buffer) => CVCL.private.decode(buffer)


var test = `
A: true
B: "X"
-1: "test"
-2: "test"
1: "override"
-: "Hey"
`

const [__test] = CVCL.public.decode(test)
__test.forAll((i, j) => {
    console.log(`${i} : ${j}`)
})
/*
const [decodedText] = CVCL.public.decode(test)
decodedText.forAll((i, j) => {
    console.log(i + " : " + j)
})
*/
