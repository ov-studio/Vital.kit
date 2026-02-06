----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: Module: Lua: table.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Table Utils ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    pairs = pairs,
    tostring = tostring,
    tonumber = tonumber,
    json = json,
    select = select,
    unpack = table.unpack,
    print = print,
    getmetatable = getmetatable
}
json = nil


----------------------
--[[ Class: Table ]]--
----------------------

local table = class:create("table", table)
table.private.inspectTypes = {
    raw = {
        ["nil"] = true,
        ["string"] = true,
        ["number"] = true,
        ["boolean"] = true
    }
}

function table.public.encode(input, format, ...)
    if not input or (imports.type(input) ~= "table") then return false end
    format = format or "json"
    if format == "json" then return imports.json.encode(input, ...) end
    return false
end

function table.public.decode(baseString, format, ...)
    if not baseString or (imports.type(baseString) ~= "string") then return false end
    format = format or "json"
    if format == "json" then return imports.json.decode(baseString, ...) end
    return false
end

function table.public.clone(input, isRecursive)
    if not input or (imports.type(input) ~= "table") then return false end
    local __baseTable = {}
    for i, j in imports.pairs(input) do
        if (imports.type(j) == "table") and isRecursive then
            __baseTable[i] = table.public.clone(j, isRecursive)
        else
            __baseTable[i] = j
        end
    end
    return __baseTable
end

function table.private.inspect(input, showHidden, limit, level, buffer, skipTrim)
    local dataType = imports.type(input)
    showHidden, limit, level, buffer = (showHidden and true) or false, math.max(1, imports.tonumber(limit) or 0) + 1, math.max(1, imports.tonumber(level) or 0), buffer or table.public.pack()
    if dataType ~= "table" then
        table.public.insert(buffer, ((table.private.inspectTypes.raw[dataType] and (((dataType == "string") and string.format("%q", input)) or imports.tostring(input))) or ("<"..imports.tostring(input)..">")).."\n")
    elseif level > limit then
        table.public.insert(buffer, "{...}\n")
    else
        table.public.insert(buffer, "{\n")
        local indent = string.rep(" ", 2*level)
        for k, v in imports.pairs(input) do
            table.public.insert(buffer, indent..imports.tostring(k)..": ")
            if k ~= "__index" then
                table.private.inspect(v, showHidden, limit, level + 1, buffer, true)
            end
        end
        if showHidden then
            local metadata = imports.getmetatable(input)
            if metadata then
                table.public.insert(buffer, indent.."<metadata>: ")
                table.private.inspect(metadata, showHidden, limit, level + 1, buffer, true)
            end
        end
        indent = string.rep(" ", 2*(level - 1))
        table.public.insert(buffer, indent.."}\n")
    end
    if not skipTrim then table.public.remove(buffer) end
    return table.public.concat(buffer)
end
function table.public.inspect(...) return table.private.inspect(table.public.unpack(table.public.pack(...), 3)) end 

function table.public.print(...)
    return imports.print(table.public.inspect(...))
end

function table.public.keys(input)
    if not input or (imports.type(input) ~= "table") then return false end
    local indexCache, __baseTable = {}, {}
    for i, j in imports.pairs(input) do
        if i ~= "__T" then
            indexCache[i] = true
            table.public.insert(__baseTable, i)
        end
    end
    for i = 1, #input, 1 do
        if not indexCache[i] then
            table.public.insert(__baseTable, i)
        end
    end
    return __baseTable
end

unpack = function(...) return table.public.unpack(...) end
inspect = function(...) return table.public.inspect(...) end
iprint = function(...) return imports.print(table.public.inspect(...)) end
