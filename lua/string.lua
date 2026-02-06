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
    function j.public.void(base)
        if not base or (imports.type(base) ~= "string") then return false end
        return (not j.public.find(base, "[%S]") and true) or false
    end
    
    local raw_len = j.public.len
    function j.public.len(base)
        if not base or (imports.type(base) ~= "string") then return false end
        return raw_len(base)
    end
    
    function j.public.parse(base)
        if not base then return false end
        if imports.tostring(base) == "nil" then return nil
        elseif imports.tostring(base) == "false" then return false
        elseif imports.tostring(base) == "true" then return true
        else return imports.tonumber(base) or base end
    end
    
    function j.public.parse_hex(base)
        if not base then return false end
        base = j.public.gsub(base, "#", "")
        return imports.tonumber("0x"..j.public.sub(base, 1, 2)) or 0, imports.tonumber("0x"..j.public.sub(base, 3, 4)) or 0, imports.tonumber("0x"..j.public.sub(base, 5, 6)) or 0
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
        return imports.j.format("%02d:%02d:%02d", hours, minutes, seconds)
    end
    
    function j.public.split(base, separator)
        if not base or (imports.type(base) ~= "string") or not separator or (imports.type(separator) ~= "string") then return false end
        local result = {}
        local index = 1
        local length = j.public.len(separator)
        while(true) do
            local ref = j.public.find(base, separator, index, true)
            if not ref then
                table.insert(result, j.public.sub(base, index))
                break
            end
            table.insert(result, j.public.sub(base, index, ref - 1))
            index = ref + length
        end 
        return result
    end

    function j.public.kern(base, kerner)
        if not base or (imports.type(base) ~= "string") then return false end
        return j.public.sub(j.public.gsub(base, ".", (kerner or " ").."%0"), 2)
    end
    
    function j.public.detab(base)
        if not base or (imports.type(base) ~= "string") then return false end
        return j.public.gsub(base, "\t", "    ")
    end
    
    function j.public.compress(base)
        if not base or (imports.type(base) ~= "string") then return false end
        return shrinker.compress(base)
    end

    function j.public.decompress(base)
        if not base or (imports.type(base) ~= "string") then return false end
        return shrinker.decompress(base)
    end
end