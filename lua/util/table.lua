----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: util: table.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Table Utils ]]--
----------------------------------------------------------------


---------------------
--[[ Util: Table ]]--
---------------------

local private = {
    rawset = rawset,
    rawget = rawget,
    unpack = util.table.unpack,
    json = json
}
json = nil

function util.table.len(input)
  return private.rawget(input, "n") or #input
end

function util.table.unpack(input, start_at, end_at)
  return private.unpack(input, start_at or 1, end_at or util.table.len(input))
end

function util.table.insert(input, value, index)
    local n = util.table.len(input)
    if index == nil then
        input[n + 1] = value
        private.rawset(input, "n", n + 1)
    else
        for i = n, index, -1 do
            input[i + 1] = input[i]
        end
        input[index] = value
        private.rawset(input, "n", n + 1)
    end
end

function util.table.remove(input, index)
    local n = util.table.len(input)
    if n == 0 then return nil end
    index = index or n
    if (index < 1) or (index > n) then return nil end
    local result = input[index]
    for i = index, n - 1 do
        input[i] = input[i + 1]
    end
    input[n] = nil
    private.rawset(input, "n", n - 1)
    return result
end

function util.table.encode(input, mode, ...)
    if not input or (type(input) ~= "table") then return false end
    mode = mode or "JSON"
    if mode == "JSON" then return private.json.encode(input, ...) end
    return false
end

function util.table.decode(input, mode, ...)
    if not input or (type(input) ~= "string") then return false end
    mode = mode or "JSON"
    if mode == "JSON" then return private.json.decode(input, ...) end
    return false
end

function util.table.clone(input, recursive)
    if not input or (type(input) ~= "table") then return false end
    local result = {}
    for i, j in pairs(input) do
        if (type(j) == "table") and recursive then
            result[i] = util.table.clone(j, recursive)
        else
            result[i] = j
        end
    end
    return result
end