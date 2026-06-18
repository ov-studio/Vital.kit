----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: module: lua: engine.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Engine Utils ]]--
----------------------------------------------------------------


----------------------
--[[ Core: Engine ]]--
----------------------

local private = {}

function private.inspect(input, show_hidden, depth_limit, level, buffer, visited)
    local input_type = type(input)
    show_hidden = (show_hidden and true) or false
    depth_limit = core.util.math.max(1, tonumber(depth_limit) or 10)
    level = core.util.math.max(0, tonumber(level) or 0)
    buffer = buffer or core.util.table.pack()
    visited = visited or {}
    if input_type ~= "table" then
        local input_types = {["nil"] = true, ["boolean"] = true, ["string"] = true, ["number"] = true}
        core.util.table.insert(buffer, ((input_types[input_type] and (((input_type == "string") and util.string.format("%q", input)) or tostring(input))) or ("<"..tostring(input)..">")).."\n")
    elseif level > depth_limit then
        core.util.table.insert(buffer, "{...}\n")
    elseif visited[input] then
        core.util.table.insert(buffer, "{<circular>}\n")
    else
        visited[input] = true
        core.util.table.insert(buffer, "{\n")
        local indent = util.string.rep("\t", level + 1)
        local scalar_keys, table_keys = {}, {}
        for k, v in pairs(input) do
            if type(v) == "table" then
                core.util.table.insert(table_keys, k)
            else
                core.util.table.insert(scalar_keys, k)
            end
        end
        core.util.table.sort(scalar_keys, function(a, b) return tostring(a) < tostring(b) end)
        core.util.table.sort(table_keys, function(a, b) return tostring(a) < tostring(b) end)
        local ordered_keys = {}
        for _, k in ipairs(scalar_keys) do core.util.table.insert(ordered_keys, k) end
        for _, k in ipairs(table_keys) do core.util.table.insert(ordered_keys, k) end
        for _, k in ipairs(ordered_keys) do
            local v = input[k]
            core.util.table.insert(buffer, indent..tostring(k)..": ")
            if k ~= "__index" then
                engine.private.inspect(v, show_hidden, depth_limit, level + 1, buffer, visited)
            else
                core.util.table.insert(buffer, "{<__index>}\n")
            end
        end
        if show_hidden then
            local metadata = getmetatable(input)
            if metadata and not visited[metadata] then
                core.util.table.insert(buffer, indent.."<metatable>: ")
                engine.private.inspect(metadata, show_hidden, depth_limit, level + 1, buffer, visited)
            end
        end
        core.util.table.insert(buffer, util.string.rep("\t", level).."}\n")
        visited[input] = nil
    end
    return core.util.table.concat(buffer)
end

function core.engine.inspect(...) 
    return engine.private.inspect(core.util.table.unpack(core.util.table.pack(...), 1, 3))
end

function core.engine.iprint(input, ...)
    local separator = ((engine.public.get_platform() == "client") and "> ") or "> "
    local output = core.engine.inspect(input, ...)
    local result = "Inspect: "..tostring(input).."\n"
    result = result..util.string.gsub(output, "([^\n]+)", separator.."%1")
    return engine.public.print("info", result)
end
