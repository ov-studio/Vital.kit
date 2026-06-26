----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: string.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: String Utils ]]--
----------------------------------------------------------------


----------------------
--[[ Util: String ]]--
----------------------

local private = {}

function util.string.void(input)
    if not input or (imports.type(input) ~= "string") then return false end
    return (not util.string.find(input, "[%S]") and true) or false
end

function util.string.parse(input)
    if imports.tostring(input) == "nil" then return nil
    elseif imports.tostring(input) == "false" then return false
    elseif imports.tostring(input) == "true" then return true
    else return imports.tonumber(input) or input end
end

function util.string.parse_hex(input)
    if not input then return false end
    input = util.string.gsub(input, "#", "")
    return imports.tonumber("0x"..util.string.sub(input, 1, 2)) or 0, imports.tonumber("0x"..util.string.sub(input, 3, 4)) or 0, imports.tonumber("0x"..util.string.sub(input, 5, 6)) or 0
end

function util.string.format_time(milliseconds)
    milliseconds = imports.tonumber(milliseconds)
    if not milliseconds then return false end
    milliseconds = math.floor(milliseconds)
    local totalSeconds = math.floor(milliseconds/1000)
    local seconds = totalSeconds%60
    local minutes = math.floor(totalSeconds/60)
    local hours = math.floor(minutes/60)
    minutes = minutes%60
    return j.format("%02d:%02d:%02d", hours, minutes, seconds)
end

function util.string.split(input, separator)
    if not input or (imports.type(input) ~= "string") or not separator or (imports.type(separator) ~= "string") then return false end
    local result = {}
    local index = 1
    local count = 1
    local length = #separator
    while true do
        local match = util.string.find(input, separator, index, true)
        if not match then
            result[count] = util.string.sub(input, index)
            break
        end
        result[count] = util.string.sub(input, index, match - 1)
        count = count + 1
        index = match + length
    end 
    return result
end

function util.string.kern(input, kerner)
    if not input or (imports.type(input) ~= "string") then return false end
    return util.string.sub(util.string.gsub(input, ".", (kerner or " ").."%0"), 2)
end

function util.string.detab(input)
    if not input or (imports.type(input) ~= "string") then return false end
    return util.string.gsub(input, "\t", "    ")
end