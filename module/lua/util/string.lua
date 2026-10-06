----------------------------------------------------------------
--[[ Resource: Vital.kit
     Script: util: string.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: String Utils ]]--
----------------------------------------------------------------


----------------------
--[[ Util: String ]]--
----------------------

local private = {
    type = type,
    tostring = tostring,
    tonumber = tonumber,
    find = util.string.find,
    sub = util.string.sub,
    gsub = util.string.gsub,
    format = util.string.format,
    floor = util.math.floor
}

function util.string.void(input)
    if private.type(input) ~= "string" then return false end
    return not private.find(input, "%S")
end

function util.string.parse(input)
    local input_type = private.type(input)
    if input_type == "number" or input_type == "boolean" then return input
    elseif input_type == "nil" then return nil end
    local text = (input_type == "string") and input or private.tostring(input)
    if text == "nil" then return nil
    elseif text == "false" then return false
    elseif text == "true" then return true end
    return private.tonumber(input) or input
end

function util.string.parse_hex(input)
    if not input then return false end
    input = private.gsub(input, "#", "")
    return private.tonumber("0x"..private.sub(input, 1, 2)) or 0, private.tonumber("0x"..private.sub(input, 3, 4)) or 0, private.tonumber("0x"..private.sub(input, 5, 6)) or 0
end

function util.string.format_time(milliseconds)
    milliseconds = private.tonumber(milliseconds)
    if not milliseconds then return false end
    local total_seconds = private.floor(private.floor(milliseconds)/1000)
    local minutes = private.floor(total_seconds/60)
    local hours = private.floor(minutes/60)
    return private.format("%02d:%02d:%02d", hours, minutes%60, total_seconds%60)
end

function util.string.split(input, separator)
    if (private.type(input) ~= "string") or (private.type(separator) ~= "string") or (separator == "") then return false end
    local result = {}
    local index = 1
    local count = 1
    local length = #separator
    while true do
        local match = private.find(input, separator, index, true)
        if not match then
            result[count] = private.sub(input, index)
            break
        end
        result[count] = private.sub(input, index, match - 1)
        count = count + 1
        index = match + length
    end
    return result
end

function util.string.kern(input, kerner)
    if private.type(input) ~= "string" then return false end
    return private.sub(private.gsub(input, ".", (kerner or " ").."%0"), 2)
end

function util.string.detab(input)
    if private.type(input) ~= "string" then return false end
    return private.gsub(input, "\t", "    ")
end
