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

local private = {
    type = type,
    tostring = tostring,
    tonumber = tonumber,
    pairs = pairs,
    getmetatable = getmetatable,
    format = util.string.format,
    rep = util.string.rep,
    gsub = util.string.gsub,
    sort = util.table.sort,
    concat = util.table.concat,
    max = util.math.max,
    indents = {}
}

function private.indent(level)
    local result = private.indents[level]
    if not result then
        result = private.rep("\t", level)
        private.indents[level] = result
    end
    return result
end

function private.inspect(input, show_hidden, depth_limit, level, buffer, n, visited)
    local input_type = private.type(input)
    if input_type ~= "table" then
        if input_type == "string" then
            buffer[n + 1] = private.format("%q", input)
        elseif (input_type == "nil") or (input_type == "boolean") or (input_type == "number") then
            buffer[n + 1] = private.tostring(input)
        else
            buffer[n + 1] = "<"..private.tostring(input)..">"
        end
        buffer[n + 2] = "\n"
        return n + 2
    elseif level > depth_limit then
        buffer[n + 1] = "{...}\n"
        return n + 1
    elseif visited[input] then
        buffer[n + 1] = "{<circular>}\n"
        return n + 1
    end

    visited[input] = true
    buffer[n + 1] = "{\n"
    n = n + 1
    local indent = private.indent(level + 1)

    local names, scalar_keys, table_keys, scalar_count, table_count = {}, {}, {}, 0, 0
    for k, v in private.pairs(input) do
        names[k] = private.tostring(k)
        if private.type(v) == "table" then
            table_count = table_count + 1
            table_keys[table_count] = k
        else
            scalar_count = scalar_count + 1
            scalar_keys[scalar_count] = k
        end
    end
    if (scalar_count > 1) or (table_count > 1) then
        local function compare(a, b) return names[a] < names[b] end
        if scalar_count > 1 then private.sort(scalar_keys, compare) end
        if table_count > 1 then private.sort(table_keys, compare) end
    end

    for pass = 1, 2 do
        local keys, count = scalar_keys, scalar_count
        if pass == 2 then keys, count = table_keys, table_count end
        for i = 1, count do
            local k = keys[i]
            buffer[n + 1] = indent
            buffer[n + 2] = names[k]
            buffer[n + 3] = ": "
            n = n + 3
            if k ~= "__index" then
                n = private.inspect(input[k], show_hidden, depth_limit, level + 1, buffer, n, visited)
            else
                buffer[n + 1] = "{<__index>}\n"
                n = n + 1
            end
        end
    end

    if show_hidden then
        local metadata = private.getmetatable(input)
        if metadata and not visited[metadata] then
            buffer[n + 1] = indent
            buffer[n + 2] = "<metatable>: "
            n = n + 2
            n = private.inspect(metadata, show_hidden, depth_limit, level + 1, buffer, n, visited)
        end
    end
    if level > 0 then
        n = n + 1
        buffer[n] = private.indent(level)
    end
    buffer[n + 1] = "}\n"
    visited[input] = nil
    return n + 1
end

function core.engine.inspect(input, show_hidden, depth_limit)
    local buffer = {}
    local n = private.inspect(input, (show_hidden and true) or false, private.max(1, private.tonumber(depth_limit) or 10), 0, buffer, 0, {})
    return private.concat(buffer, "", 1, n)
end

function core.engine.iprint(input, ...)
    local separator = "> "
    local result = "Inspect: "..private.tostring(input).."\n"..separator..private.gsub(core.engine.inspect(input, ...), "\n", "\n"..separator)
    return core.engine.print("info", result)
end
