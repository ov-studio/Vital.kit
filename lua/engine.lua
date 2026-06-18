----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: module: lua: engine.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Engine Utils ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    pairs = pairs,
    ipairs = ipairs,
    tonumber = tonumber,
    tostring = tostring
}


---------------------------
--[[ Namespace: Engine ]]--
---------------------------

local engine = class:create("engine", engine)

function engine.private.inspect(input, show_hidden, depth_limit, level, buffer, visited)
    local input_type = imports.type(input)
    show_hidden = (show_hidden and true) or false
    depth_limit = math.max(1, imports.tonumber(depth_limit) or 10)
    level = math.max(0, imports.tonumber(level) or 0)
    buffer = buffer or table.pack()
    visited = visited or {}
    if input_type ~= "table" then
        local input_types = {["nil"] = true, ["boolean"] = true, ["string"] = true, ["number"] = true}
        table.insert(buffer, ((input_types[input_type] and (((input_type == "string") and string.format("%q", input)) or imports.tostring(input))) or ("<"..imports.tostring(input)..">")).."\n")
    elseif level > depth_limit then
        table.insert(buffer, "{...}\n")
    elseif visited[input] then
        table.insert(buffer, "{<circular>}\n")
    else
        visited[input] = true
        table.insert(buffer, "{\n")
        local indent = string.rep("\t", level + 1)
        local scalar_keys, table_keys = {}, {}
        for k, v in imports.pairs(input) do
            if imports.type(v) == "table" then
                table.insert(table_keys, k)
            else
                table.insert(scalar_keys, k)
            end
        end
        table.sort(scalar_keys, function(a, b) return imports.tostring(a) < imports.tostring(b) end)
        table.sort(table_keys, function(a, b) return imports.tostring(a) < imports.tostring(b) end)
        local ordered_keys = {}
        for _, k in imports.ipairs(scalar_keys) do table.insert(ordered_keys, k) end
        for _, k in imports.ipairs(table_keys) do table.insert(ordered_keys, k) end
        for _, k in imports.ipairs(ordered_keys) do
            local v = input[k]
            table.insert(buffer, indent..imports.tostring(k)..": ")
            if k ~= "__index" then
                engine.private.inspect(v, show_hidden, depth_limit, level + 1, buffer, visited)
            else
                table.insert(buffer, "{<__index>}\n")
            end
        end
        if show_hidden then
            local metadata = imports.getmetatable(input)
            if metadata and not visited[metadata] then
                table.insert(buffer, indent.."<metatable>: ")
                engine.private.inspect(metadata, show_hidden, depth_limit, level + 1, buffer, visited)
            end
        end
        table.insert(buffer, string.rep("\t", level).."}\n")
        visited[input] = nil
    end
    return table.concat(buffer)
end
function engine.public.inspect(...) return engine.private.inspect(table.unpack(table.pack(...), 1, 3)) end

function engine.public.iprint(input, ...)
    local separator = ((engine.public.get_platform() == "client") and "> ") or "> "
    local output = engine.public.inspect(input, ...)
    local result = "Inspect: "..tostring(input).."\n"
    result = result..string.gsub(output, "([^\n]+)", separator.."%1")
    return engine.public.print("info", result)
end
