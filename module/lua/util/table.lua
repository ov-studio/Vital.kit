----------------------------------------------------------------
--[[ Resource: Vital.kit
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
    type = type,
    pairs = pairs,
    rawset = rawset,
    rawget = rawget,
    unpack = util.table.unpack,
    move = util.table.move
}

function private.clone(input, recursive)
    if private.type(input) ~= "table" then return false end
    local result = {}
    if recursive then
        for i, j in private.pairs(input) do
            if private.type(j) == "table" then
                result[i] = private.clone(j, true)
            else
                result[i] = j
            end
        end
    else
        for i, j in private.pairs(input) do
            result[i] = j
        end
    end
    return result
end

function util.table.len(input)
    return private.rawget(input, "n") or #input
end

function util.table.unpack(input, start_at, end_at)
    return private.unpack(input, start_at or 1, end_at or private.rawget(input, "n") or #input)
end

function util.table.insert(input, value, index)
    local n = private.rawget(input, "n")
    local tracked = (n ~= nil)
    if not tracked then n = #input end
    if index == nil then
        n = n + 1
        input[n] = value
    else
        if index <= n then private.move(input, index, n, index + 1) end
        input[index] = value
        n = n + 1
    end
    if tracked then input.n = n else private.rawset(input, "n", n) end
end

function util.table.remove(input, index)
    local n = private.rawget(input, "n")
    local tracked = (n ~= nil)
    if not tracked then n = #input end
    if n == 0 then return nil end
    index = index or n
    if (index < 1) or (index > n) then return nil end
    local result = input[index]
    if index < n then private.move(input, index + 1, n, index) end
    input[n] = nil
    if tracked then input.n = n - 1 else private.rawset(input, "n", n - 1) end
    return result
end

function util.table.clone(input, recursive)
    return private.clone(input, recursive)
end
