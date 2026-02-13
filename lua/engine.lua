----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: Module: Lua: engine.lua
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
    tonumber = tonumber,
    tostring = tostring
}


-----------------------
--[[ Class: Engine ]]--
-----------------------

local engine = class:create("engine", engine)

function engine.private.inspect(input, show_hidden, limit, level, buffer, skip_trim, visited)
    local input_type = imports.type(input)
    show_hidden = (show_hidden and true) or false
    limit = math.max(1, imports.tonumber(limit) or 10)
    level = math.max(0, imports.tonumber(level) or 0)
    buffer = buffer or table.pack()
    visited = visited or {}
    if input_type ~= "table" then
        local input_types = {["nil"] = true, ["boolean"] = true, ["string"] = true, ["number"] = true}
        table.insert(buffer, ((input_types[input_type] and (((input_type == "string") and string.format("%q", input)) or imports.tostring(input))) or ("<"..imports.tostring(input)..">")).."\n")
    elseif level > limit then
        table.insert(buffer, "{...}\n")
    elseif visited[input] then
        table.insert(buffer, "{<circular>}\n")
    else
        visited[input] = true
        table.insert(buffer, "{\n")
        local indent = string.rep("  ", level + 1)
        for k, v in imports.pairs(input) do
            table.insert(buffer, indent..imports.tostring(k)..": ")
            if k ~= "__index" then
                engine.private.inspect(v, show_hidden, limit, level + 1, buffer, true, visited)
            else
                table.insert(buffer, "{<__index>}\n")
            end
        end
        if show_hidden then
            local metadata = imports.getmetatable(input)
            if metadata and not visited[metadata] then
                table.insert(buffer, indent.."<metatable>: ")
                engine.private.inspect(metadata, show_hidden, limit, level + 1, buffer, true, visited)
            end
        end
        table.insert(buffer, string.rep("  ", level).."}\n")
        visited[input] = nil
    end
    if not skip_trim then table.remove(buffer) end
    return table.concat(buffer)
end
function engine.public.inspect(...) return engine.private.inspect(table.unpack(table.pack(...), 1, 3)) end

function engine.public.iprint(...)
    return engine.public.print(engine.public.inspect(...))
end


--TODO: Requires rework
--[[
engine.private.binds = {
    key = {},
    command = {}
}

function engine.private.isBindSourceValid(type, parent, ref, exec)
    if not type or not parent or not ref or not exec then return false end
    if (imports.type(type) ~= "string") or not engine.private.binds[type] then return false end
    if (imports.type(parent) ~= "string") or (imports.type(ref) ~= "string") or (imports.type(exec) ~= "function") then return false end
    return true
end

function engine.private.bind(type, parent, ref, exec)
    if not engine.private.isBindSourceValid(type, parent, ref, exec) then return false end
    engine.private.binds[type][ref] = engine.private.binds[type][ref] or {}
    engine.private.binds[type][ref][parent] = engine.private.binds[type][ref][parent] or {}
    if engine.private.binds[type][ref][exec] then return false end
    engine.private.binds[type][ref][exec] = true
    return true
end

function engine.private.unbind(type, parent, ref, exec)
    if not engine.private.isBindSourceValid(type, parent, ref, exec) then return false end
    if not engine.private.binds[type][ref] or not engine.private.binds[type][ref][parent] or not engine.private.binds[type][ref][exec] then return false end
    engine.private.binds[type][ref][exec] = nil
    return true
end

function engine.private.executeBind(type, ref)
    if (imports.type(type) ~= "string") or not engine.private.binds[type] then return false end
    if engine.private.binds[type][ref] then
        for i, j in imports.pairs(engine.private.binds[type][ref]) do
            for k, v in imports.pairs(j) do
                v(type, ref)
            end
        end
    end
    return true
end

function engine.public.bindKey(...) return engine.private.bind("key", ...) end
function engine.public.unbindKey(...) return engine.private.unbind("key", ...) end
function engine.public.executeBindKey(...) return engine.private.executeBind("key", ...) end
function engine.public.bindCommand(...) return engine.private.bind("command", ...) end
function engine.public.unbindComand(...) return engine.private.unbind("command", ...) end
function engine.public.executeBindCommand(...) return engine.private.executeBind("command", ...) end
]]