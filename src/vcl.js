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
const private = {}


/////////////////
// Class: VCL //
/////////////////

vKit.vcl = {}
private.types = {
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

// @Desc: Verifies whether rw is void
private.isVoid = (rw) => (!vKit.String.match(rw, "[\\w]") && true) || false

// @Desc: Fetches rw by index
private.fetch = (rw, index) => vKit.String.sub(rw, index, index + 1)

// @Desc: Fetches rw's line by index
private.fetchLine = (rw, index) => {
    if (rw) {
        const rwLines = vKit.String.sub(rw, 0, index).split(private.types.newline)
        return [Math.max(1, rwLines.length), rwLines[(rwLines.length - 1)] || ""]
    }
    return false
}

// @Desc: Parses comment
private.parseComment = (parser, buffer, rw) => {
    if (!parser.isType && (rw == private.types.comment)) {
        const [line, lineText] = private.fetchLine(vKit.String.sub(buffer, 0, parser.ref))
        const rwLines = buffer.split(private.types.newline)
        parser.ref = parser.ref - lineText.length + rwLines[(line - 1)].length
    }
    return true
}

// @Desc: Parses boolean
private.parseBoolean = (parser, buffer, rw) => {
    if (!parser.isType || (parser.isType == "bool")) {
        if (!parser.isType) {
            for (const i in private.types.bool) {
                if (vKit.String.sub(buffer, parser.ref, parser.ref + i.length) == i) {
                    rw = i
                    break
                }
            }
        }
        if (!parser.isType && private.types.bool[rw]) {
            parser.isSkipAppend = true, parser.ref = parser.ref + rw.length - 1, parser.isType = "bool", parser.value = rw
        }
        else if (parser.isType) {
            if (rw == private.types.newline) parser.isSkipAppend = true, parser.isParsed = true
            else return false
        }
    }
    return true
}

// @Desc: Parses number
private.parseNumber = (parser, buffer, rw) => {
    if (!parser.isType || (parser.isType == "number")) {
        var isNumber = vKit.Number(rw)
        if (!parser.isType) {
            const isNegative = rw == private.types.negative
            if (isNegative || !vKit.isBool(isNumber)) parser.isType = "number", parser.isTypeNegative = (isNegative && parser.ref) || false
        }
        else {
            if (rw == private.types.decimal) {
                if (!parser.isTypeFloat) parser.isTypeFloat = true
                else return false
            }
            else if (!parser.isTypeFloat && parser.isTypeNegative && ((private.isVoid(parser.index) && (rw == private.types.space)) || (rw == private.types.init))) {
                parser.ref = parser.isTypeNegative - 1, parser.index = "", parser.isType = "object", parser.isTypeFloat = false, parser.isTypeNegative = false
            }
            else if (rw == private.types.newline) parser.isParsed = true
            else if (vKit.isBool(isNumber)) return false
        }
    }
    return true
}

// @Desc: Parses string
private.parseString = (parser, buffer, rw) => {
    if (!parser.isType || (parser.isType == "string")) {
        if ((!parser.isTypeChar && private.types.string[rw]) || parser.isTypeChar) {
            if (!parser.isType) parser.isSkipAppend = true, parser.isType = "string", parser.isTypeChar = rw
            else if (rw == parser.isTypeChar) {
                if (!parser.isTypeParsed) parser.isSkipAppend = true, parser.isTypeParsed = true
                else return false
            }
            else if (parser.isTypeParsed) {
                if (rw == private.types.newline) parser.isParsed = true
                else return false
            }
        }
    }
    return true
}

// @Desc: Parses object
private.parseObject = (parser, buffer, rw, isChild) => {
    if (parser.isType == "object") {
        if (private.isVoid(parser.index) && (rw == private.types.list)) parser.isTypeID = parser.ref
        else if (!private.isVoid(rw)) parser.index = parser.index + rw
        else {
            if (parser.isTypeID && private.isVoid(parser.index) && (rw == private.types.init)) parser.index = vKit.String(parser.pointer.getLength())
            if (!private.isVoid(parser.index)) {
                if (parser.isTypeID && (rw == private.types.newline)) parser.pointer.set(parser.pointer.getLength(), parser.index)
                else if (rw == private.types.init) {
                    const [, lineText] = private.fetchLine(vKit.String.sub(buffer, 0, parser.ref))
                    const indexTypePadding = (parser.isTypeID && (parser.ref - parser.isTypeID - 1)) || 0
                    const indexPadding = lineText.length - parser.index.length - indexTypePadding - 1
                    if (isChild) {
                        parser.padding = parser.padding || indexPadding - 1
                        if (indexPadding <= parser.padding) {
                            parser.ref = parser.ref - parser.index.length - indexTypePadding
                            return false
                        }
                    }
                    if (parser.isTypeID) parser.isTypeID = false, parser.index = vKit.Number(parser.index)
                    if (!private.isVoid(parser.index)) {
                        const [value, __index, error] = private.decode(buffer, parser.ref + 1, indexPadding, true)
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
            if (vKit.isNumber(parser.isChildErrored)) return false
        }
    }
    return true
}

// @Desc: Parses return
private.parseReturn = (parser, buffer) => {
    parser.isParsed = (!vKit.isNumber(parser.isChildErrored) && ((parser.isType == "object") || parser.isParsed) && true) || false
    if (!parser.isParsed) {
        if (!vKit.isNumber(parser.isChildErrored) || (parser.isChildErrored == 0)) {
            const [line] = private.fetchLine(buffer, parser.ref)
            parser.isErrored = vKit.String.format(parser.isErrored, line, (parser.isType && "Malformed " + parser.isType) || "Invalid declaration")
            vKit.print(parser.isErrored)
        }
        return [false, false, true]
    }
    else if (parser.isType == "object") return [parser.pointer, parser.ref]
    else if (parser.isType == "bool") return [((parser.value == "true") && true) || false, parser.ref]
    else {
        if (parser.isType == "number") parser.value = vKit.Number(parser.value)
        return [parser.value, parser.ref]
    }
}

// @Desc: Encodes vcl buffer
private.encode = (buffer, padding) => {
    if (!buffer || !vKit.isObject(buffer)) return false
    padding = padding || ""
    var result = "", indexes = {numeric: [], index: []}
    buffer.forAll((i, j) => {
        if (vKit.isObject(j)) ((vKit.isNumber(i) && indexes.numeric) || indexes.index).push(i)
        else {
            i = (vKit.isNumber(i) && ("- " + String(i))) || i
            if (vKit.isString(j)) j = "\"" + j + "\""
            result = result + private.types.newline + padding + i + private.types.init + private.types.space + String(j)
        }
    })
    indexes.numeric.sort((a, b) => a - b)
    indexes.numeric.forEach((j) => {
        result = result + private.types.newline + padding + private.types.list + private.types.space + j + private.types.init + private.encode(buffer.get(j), padding + private.types.tab)
    })
    indexes.index.forEach((j) => {
        result = result + private.types.newline + padding + j + private.types.init + private.encode(buffer.get(j), padding + private.types.tab)
    })
    return result
}
vKit.vcl.encode = (buffer) => private.encode(buffer)

// @Desc: Decodes vcl buffer
private.decode = (buffer, ref, padding, isChild) => {
    if (!buffer || (typeof(buffer) != "string")) return false
    if (vKit.String.isVoid(buffer)) return []
    const parser = {
        ref: ref || 1, padding: padding,
        index: "", pointer: vKit.Object(), value: "",
        isErrored: "Failed to decode vcl. [Line: %0] [Reason: %1]"
    }
    if (!isChild) {
        buffer = vKit.String.replace(vKit.String.detab(buffer), private.types.carriageline, "")
        buffer = (!isChild && (private.fetch(buffer, buffer.length) != private.types.newline) && (buffer + private.types.newline)) || buffer   
    }
    while(parser.ref <= buffer.length) {
        private.parseComment(parser, buffer, private.fetch(buffer, parser.ref))
        if (isChild) {
            parser.isSkipAppend = false
            if (!private.parseBoolean(parser, buffer, private.fetch(buffer, parser.ref))) break
            if (!private.parseNumber(parser, buffer, private.fetch(buffer, parser.ref))) break
            if (!private.parseString(parser, buffer, private.fetch(buffer, parser.ref))) break
            if (parser.isType && !parser.isSkipAppend && !parser.isParsed) parser.value = parser.value + private.fetch(buffer, parser.ref)
        }
        parser.isType = (!parser.isType && ((private.fetch(buffer, parser.ref) == private.types.list) || !private.isVoid(private.fetch(buffer, parser.ref))) && "object") || parser.isType
        if (!private.parseObject(parser, buffer, private.fetch(buffer, parser.ref), isChild)) break
        if (isChild && !vKit.isNumber(parser.isChildErrored) && parser.isParsed) break
        parser.ref = parser.ref + 1
    }
    return private.parseReturn(parser, buffer)
}
vKit.vcl.decode = (buffer) => private.decode(buffer)