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
    rawset = rawset,
    rawget = rawget,
    unpack = table.unpack,
    getmetatable = getmetatable,
    json = json
}
json = nil


----------------------
--[[ Class: Table ]]--
----------------------

local table = class:create("table", table)
table.private.inspectable = {
    ["nil"] = true,
    ["string"] = true,
    ["number"] = true,
    ["boolean"] = true
}

function table.public.len(input)
  return imports.rawget(input, "n") or #input
end

function table.unpack(input, start_at, end_at)
  return imports.unpack(input, start_at or 1, end_at or table.public.len(input))
end

function table.insert(input, value, index)
    local n = table.public.len(input)
    if index == nil then
        input[n + 1] = value
        imports.rawset(input, "n", n + 1)
    else
        for i = n, index, -1 do
            input[i + 1] = input[i]
        end
        input[index] = value
        imports.rawset(input, "n", n + 1)
    end
end

function table.remove(input, index)
    local n = table.public.len(input)
    if n == 0 then return nil end
    index = index or n
    if (index < 1) or (index > n) then return nil end
    local result = input[index]
    for i = index, n - 1 do
        input[i] = input[i + 1]
    end
    input[n] = nil
    imports.rawset(input, "n", n - 1)
    return result
end

function table.public.encode(input, mode, ...)
    if not input or (imports.type(input) ~= "table") then return false end
    mode = mode or "JSON"
    if mode == "JSON" then return imports.json.encode(input, ...) end
    return false
end

function table.public.decode(input, mode, ...)
    if not input or (imports.type(input) ~= "string") then return false end
    mode = mode or "JSON"
    if mode == "JSON" then return imports.json.decode(input, ...) end
    return false
end

function table.public.clone(input, recursive)
    if not input or (imports.type(input) ~= "table") then return false end
    local result = {}
    for i, j in imports.pairs(input) do
        if (imports.type(j) == "table") and recursive then
            result[i] = table.public.clone(j, recursive)
        else
            result[i] = j
        end
    end
    return result
end

function table.private.inspect(input, showHidden, limit, level, buffer, skip_trim)
    local dataType = imports.type(input)
    showHidden, limit, level, buffer = (showHidden and true) or false, math.max(1, imports.tonumber(limit) or 0) + 1, math.max(1, imports.tonumber(level) or 0), buffer or table.public.pack()
    if dataType ~= "table" then
        table.public.insert(buffer, ((table.private.inspectable[dataType] and (((dataType == "string") and string.format("%q", input)) or imports.tostring(input))) or ("<"..imports.tostring(input)..">")).."\n")
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
    if not skip_trim then table.public.remove(buffer) end
    return table.public.concat(buffer)
end
function table.public.inspect(...) return table.private.inspect(table.public.unpack(table.public.pack(...), 3)) end 

function table.public.print(...)
    return engine.print(table.public.inspect(...))
end


-----------------
--[[ Aliases ]]--
-----------------

unpack = function(...) return table.public.unpack(...) end
inspect = function(...) return table.public.inspect(...) end
iprint = function(...) return engine.print(table.public.inspect(...)) end
