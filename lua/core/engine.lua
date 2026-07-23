----------------------------------------------------------------
--[[ Resource: Vital.kit
     Script: core: engine.lua
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
    depth_limit = util.math.max(1, tonumber(depth_limit) or 10)
    level = util.math.max(0, tonumber(level) or 0)
    buffer = buffer or util.table.pack()
    visited = visited or {}
    if input_type ~= "table" then
        local input_types = {["nil"] = true, ["boolean"] = true, ["string"] = true, ["number"] = true}
        util.table.insert(buffer, ((input_types[input_type] and (((input_type == "string") and util.string.format("%q", input)) or tostring(input))) or ("<"..tostring(input)..">")).."\n")
    elseif level > depth_limit then
        util.table.insert(buffer, "{...}\n")
    elseif visited[input] then
        util.table.insert(buffer, "{<circular>}\n")
    else
        visited[input] = true
        util.table.insert(buffer, "{\n")
        local indent = util.string.rep("\t", level + 1)
        local scalar_keys, table_keys = {}, {}
        for k, v in pairs(input) do
            if type(v) == "table" then
                util.table.insert(table_keys, k)
            else
                util.table.insert(scalar_keys, k)
            end
        end
        util.table.sort(scalar_keys, function(a, b) return tostring(a) < tostring(b) end)
        util.table.sort(table_keys, function(a, b) return tostring(a) < tostring(b) end)

        local ordered_keys = {}
        for _, k in ipairs(scalar_keys) do util.table.insert(ordered_keys, k) end
        for _, k in ipairs(table_keys) do util.table.insert(ordered_keys, k) end
        for _, k in ipairs(ordered_keys) do
            local v = input[k]
            util.table.insert(buffer, indent..tostring(k)..": ")
            if k ~= "__index" then
                private.inspect(v, show_hidden, depth_limit, level + 1, buffer, visited)
            else
                util.table.insert(buffer, "{<__index>}\n")
            end
        end
        
        if show_hidden then
            local metadata = getmetatable(input)
            if metadata and not visited[metadata] then
                util.table.insert(buffer, indent.."<metatable>: ")
                private.inspect(metadata, show_hidden, depth_limit, level + 1, buffer, visited)
            end
        end
        util.table.insert(buffer, util.string.rep("\t", level).."}\n")
        visited[input] = nil
    end
    return util.table.concat(buffer)
end

function core.engine.inspect(...) 
    return private.inspect(util.table.unpack(util.table.pack(...), 1, 3))
end

function core.engine.iprint(input, ...)
    local separator = "> "
    local output = core.engine.inspect(input, ...)
    local result = "Inspect: "..tostring(input).."\n"..separator
    local index = 1

    while true do
        local nl = string.find(output, "\n", index, true)
        if not nl then
            result = result..string.sub(output, index)
            break
        end
        result = result..string.sub(output, index, nl - 1).."\n"..separator
        index = nl + 1
    end
    return core.engine.print("info", result)
end