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
    function j.public.isVoid(baseString)
        if not baseString or (imports.type(baseString) ~= "string") then return false end
        return (not j.public.find(baseString, "[%S]") and true) or false
    end
    
    local raw_len = j.public.len
    function j.public.len(baseString)
        if not baseString or (imports.type(baseString) ~= "string") then return false end
        return raw_len(baseString)
    end
    
    function j.public.parse(baseString)
        if not baseString then return false end
        if imports.tostring(baseString) == "nil" then return
        elseif imports.tostring(baseString) == "false" then return false
        elseif imports.tostring(baseString) == "true" then return true
        else return imports.tonumber(baseString) or baseString end
    end
    
    function j.public.parseHex(baseString)
        if not baseString then return false end
        baseString = j.public.gsub(baseString, "#", "")
        return imports.tonumber("0x"..j.public.sub(baseString, 1, 2)) or 0, imports.tonumber("0x"..j.public.sub(baseString, 3, 4)) or 0, imports.tonumber("0x"..j.public.sub(baseString, 5, 6)) or 0
    end
    
    function j.public.formatTime(milliseconds)
        milliseconds = imports.tonumber(milliseconds)
        if not milliseconds then return false end
        milliseconds = math.floor(milliseconds)
        local totalSeconds = math.floor(milliseconds/1000)
        local seconds = totalSeconds%60
        local minutes = math.floor(totalSeconds/60)
        local hours = math.floor(minutes/60)
        minutes = minutes%60
        return imports.j.format("%02d:%02d:%02d", hours, minutes, seconds)
    end
    
    function j.public.split(baseString, separator)
        if not baseString or (imports.type(baseString) ~= "string") or not separator or (imports.type(separator) ~= "string") then return false end
        local result = {}
        local index = 1
        local length = j.public.len(separator)
        while(true) do
            local ref = j.public.find(baseString, separator, index, true)
            if not ref then
                table.insert(result, j.public.sub(baseString, index))
                break
            end
            table.insert(result, j.public.sub(baseString, index, ref - 1))
            index = ref + length
        end 
        return result
    end

    function j.public.kern(baseString, kerner)
        if not baseString or (imports.type(baseString) ~= "string") then return false end
        return j.public.sub(j.public.gsub(baseString, ".", (kerner or " ").."%0"), 2)
    end
    
    function j.public.detab(baseString)
        if not baseString or (imports.type(baseString) ~= "string") then return false end
        return j.public.gsub(baseString, "\t", "    ")
    end
    
    function j.public.compress(baseString)
        if not baseString or (imports.type(baseString) ~= "string") then return false end
        return shrinker.compress(baseString)
    end

    function j.public.decompress(baseString)
        if not baseString or (imports.type(baseString) ~= "string") then return false end
        return shrinker.decompress(baseString)
    end
end