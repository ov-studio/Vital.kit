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
    rawset = rawset,
    rawget = rawget,
    unpack = util.table.unpack,
    move = util.table.move
}

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
