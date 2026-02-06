----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: Module: Lua: string.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: String Utils ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    pairs = pairs,
    tostring = tostring,
    tonumber = tonumber,
    string = string
}


-----------------------
--[[ Class: String ]]--
-----------------------

local module = {
    ["stringn"] = class:create("stringn", string),
    ["utf8n"] = class:create("utf8n", utf8),
    ["string"] = class:create("string", table.clone(utf8))
}
utf8 = nil

for i, j in imports.pairs(imports.string) do
    module.string.public[i] = (not module.string.public[i] and j) or module.string.public[i]
end

for i, j in pairs(module) do
    function j.public.void(input)
        if not input or (imports.type(input) ~= "string") then return false end
        return (not j.public.find(input, "[%S]") and true) or false
    end
    
    function j.public.parse(input)
        if imports.tostring(input) == "nil" then return nil
        elseif imports.tostring(input) == "false" then return false
        elseif imports.tostring(input) == "true" then return true
        else return imports.tonumber(input) or input end
    end
    
    function j.public.parse_hex(input)
        if not input then return false end
        input = j.public.gsub(input, "#", "")
        return imports.tonumber("0x"..j.public.sub(input, 1, 2)) or 0, imports.tonumber("0x"..j.public.sub(input, 3, 4)) or 0, imports.tonumber("0x"..j.public.sub(input, 5, 6)) or 0
    end
    
    function j.public.format_time(milliseconds)
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
    
    function j.public.split(input, separator)
        if not input or (imports.type(input) ~= "string") or not separator or (imports.type(separator) ~= "string") then return false end
        local result = {}
        local index = 1
        local count = 1
        local length = #separator
        while true do
            local match = j.public.find(input, separator, index, true)
            if not match then
                result[count] = j.public.sub(input, index)
                break
            end
            result[count] = j.public.sub(input, index, match - 1)
            count = count + 1
            index = match + length
        end 
        
        return result
    end

    function j.public.kern(input, kerner)
        if not input or (imports.type(input) ~= "string") then return false end
        return j.public.sub(j.public.gsub(input, ".", (kerner or " ").."%0"), 2)
    end
    
    function j.public.detab(input)
        if not input or (imports.type(input) ~= "string") then return false end
        return j.public.gsub(input, "\t", "    ")
    end
end