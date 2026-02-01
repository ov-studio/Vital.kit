----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: Module: Lua: network.lua
     Author: vStudio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Network Utilities ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    pairs = pairs,
    tonumber = tonumber,
    tostring = tostring,
    network = network
}


------------------------
--[[ Class: Network ]]--
------------------------

local network = class:create("network", {
    --isServerInstance = (not localPlayer and true) or false --TODO: WIP
})
network.private.buffer = {}
network.private.exec = {}

function network.private.fetchIdentifier()
    return 123
end

function network.private.fetchArg(index, pool)
    index = imports.tonumber(index) or 1
    index = (((index - math.floor(index)) == 0) and index) or 1
    if not pool or (imports.type(pool) ~= "table") then return false end
    local value = pool[index]
    table.remove(pool, index)
    return value
end

function network.private.execute(cNetwork, exec, payload)
    local cThread = thread:getThread()
    if not cNetwork.isCallback then
        if cThread then exec(cThread, table.unpack(payload.arguments))
        else exec(table.unpack(payload.arguments)) end
        local execData = cNetwork.priority.handlers[exec] or cNetwork.handlers[exec]
        execData.config.subscriptionCount = (execData.config.subscriptionLimit and (execData.config.subscriptionCount + 1)) or false
        if execData.config.subscriptionLimit and (execData.config.subscriptionCount >= execData.config.subscriptionLimit) then
            cNetwork:off(exec)
        end
    else
        if cThread then payload.arguments = table.pack(exec(cThread, table.unpack(payload.arguments)))
        else payload.arguments = table.pack(exec(table.unpack(payload.arguments))) end
        if not payload.isRemote then
            --imports.triggerEvent("vsdk.network:main", resourceRoot, payload)
        else
            if not network.public.isServerInstance then imports.network.emit("vsdk.network:main", payload.isLatent, table.encode(payload))
            else imports.network.emit("vsdk.network:main", payload.isReceiver, payload.isLatent, table.encode(payload)) end
        end
    end
    return true
end

--TODO: MAKE THIS INJECTION SAFE SOMEHOW... STORE REF SOMEWHERE
function network.public.execute(name, ...)
    --if not string.find(name, "vsdk.network") then return false end
    --payload = table.decode(payload)

    print("Incoming network execution")
    print(name, ...)
    if true then return true end --TODO: REMOVE LATER
     
    if not payload or not payload.type or not payload.identifier then return false end
    if payload.isRestricted and (payload.identifier ~= network.private.fetchIdentifier()) then return false end
    if name == "vsdk.network:main" then
        if payload.type == "emit" then
            local cNetwork = network.public:fetch(payload.name)
            if cNetwork and not cNetwork.isCallback then
                for i = 1, table.length(cNetwork.priority.index), 1 do
                    local j = cNetwork.priority.index[i]
                    if not cNetwork.priority.handlers[j].config.isAsync then
                        network.private.execute(cNetwork, j, payload)
                    else
                        thread:create(function() network.private.execute(cNetwork, j, payload) end):resume()
                    end
                end
                for i, j in imports.pairs(cNetwork.handlers) do
                    if not j.config.isAsync then
                        network.private.execute(cNetwork, i, false, payload)
                    else
                        thread:create(function() network.private.execute(cNetwork, i, payload) end):resume()
                    end
                end
            end
        elseif payload.type == "emitCallback" then
            if not payload.isSignal then
                local cNetwork = network.public:fetch(payload.name)
                if cNetwork and cNetwork.isCallback and cNetwork.handler then
                    payload.isSignal = true
                    payload.isRestricted = true
                    if not cNetwork.handler.config.isAsync then
                        network.private.execute(cNetwork, cNetwork.handler.exec, payload)
                    else
                        thread:create(function() network.private.execute(cNetwork, cNetwork.handler.exec, payload) end):resume()
                    end
                end
            else
                if network.private.exec[(payload.exec)] then
                    network.private.exec[(payload.exec)](table.unpack(payload.arguments))
                    network.private.deserializeExec(payload.exec)
                end
            end
        end
    end
end

function network.private.serializeExec(exec)
    if not exec or (imports.type(exec) ~= "function") then return false end
    local serial = crypto.hash("SHA256", network.private.fetchIdentifier()..":"..imports.tostring(exec))
    network.private.exec[serial] = exec
    return serial
end

function network.private.deserializeExec(serial)
    network.private.exec[serial] = nil
    return true
end

function network.public:create(...)
    if self ~= network.public then return false end
    local cNetwork = self:createInstance()
    if cNetwork and not cNetwork:load(...) then
        cNetwork:destroyInstance()
        return false
    end
    return cNetwork
end

function network.public:destroy(...)
    if not network.public:isInstance(self) then return false end
    return self:unload(...)
end

function network.public:load(name, isCallback)
    if not network.public:isInstance(self) then return false end
    if not name or (imports.type(name) ~= "string") or network.private.buffer[name] then return false end
    self.name = name
    self.isCallback = (isCallback and true) or false
    if not self.isCallback then self.priority, self.handlers = {index = {}, handlers = {}}, {} end
    network.private.buffer[name] = self
    return true
end

function network.public:unload()
    if not network.public:isInstance(self) then return false end
    network.private.buffer[(self.name)] = nil
    self:destroyInstance()
    return true
end

function network.public:fetch(name, isRemote)
    if self ~= network.public then return false end
    local cNetwork = network.private.buffer[name] or false
    if not cNetwork and isRemote then
        cNetwork = network.public:create(name)
    end
    return cNetwork
end

function network.public:on(exec, config)
    if not network.public:isInstance(self) then return false end
    if not exec or (imports.type(exec) ~= "function") then return false end
    config = (config and (imports.type(config) == "table") and config) or {}
    config.isAsync = (config.isAsync and true) or false
    config.isPrioritized = (not self.isCallback and config.isPrioritized and true) or false
    config.subscriptionLimit = (not self.isCallback and imports.tonumber(config.subscriptionLimit)) or false
    config.subscriptionLimit = (config.subscriptionLimit and math.max(1, config.subscriptionLimit)) or config.subscriptionLimit
    config.subscriptionCount = (config.subscriptionLimit and 0) or false
    if self.isCallback then
        if not self.handler then
            self.handler = {exec = exec, config = config}
            return true
        end
    else
        if not self.priority.handlers[exec] and not self.handlers[exec] then
            if config.isPrioritized then
                self.priority.handlers[exec] = {index = table.length(self.priority.index) + 1, config = config}
                table.insert(self.priority.index, exec)
            else self.handlers[exec] = {config = config} end
            return true
        end
    end
    return false
end

function network.public:off(exec)
    if not network.public:isInstance(self) then return false end
    if not exec or (imports.type(exec) ~= "function") then return false end
    if self.isCallback then
        if self.handler and (self.handler == exec) then
            self.handler = nil
            return true
        end
    else
        if self.priority.handlers[exec] or self.handlers[exec] then
            if self.priority.handlers[exec] then
                for i = self.priority.handlers[exec].index + 1, table.length(self.priority.index), 1 do
                    local j = self.priority.index[i]
                    self.priority.handlers[j].index = index - 1
                end
                table.remove(self.priority.index, self.priority.handlers[exec].index)
                self.priority.handlers[exec] = nil
            else self.handlers[exec] = nil end
            return true
        end
    end
    return false
end

function network.public:emit(...)
    if not self then return false end
    local cArgs = table.pack(...)
    local payload = {
        name = false,
        type = "emit",
        identifier = network.private.fetchIdentifier(),
        isRemote = false,
        isRestricted = false
    }
    if self == network.public then
        payload.name, payload.isRemote = network.private.fetchArg(false, cArgs), network.private.fetchArg(false, cArgs)
        if payload.isRemote then
            payload.isLatent = network.private.fetchArg(false, cArgs)
            if network.public.isServerInstance then
                payload.isReceiver = network.private.fetchArg(false, cArgs)
                payload.isReceiver = (payload.isReceiver and imports.isElement(payload.isReceiver) and payload.isReceiver) or false
            end
        end
    else
        payload.name = self.name
        payload.isRestricted = true
    end
    payload.arguments = cArgs
    if not payload.isRemote then
        --TODO: FIGURE OUT SOMEHOW!!
        --imports.triggerEvent("vsdk.network:main", resourceRoot, network.private.fetchIdentifier(), payload)
    else
        if not payload.isReceiver then imports.network.emit("vsdk.network:main", payload.isLatent, table.encode(payload))
        else imports.network.emit("vsdk.network:main", payload.isReceiver, payload.isLatent, table.encode(payload)) end
    end
    return true
end

function network.public:emitCallback(...)
    if not self or not thread:getThread() then return false end
    local cPromise = thread:createPromise()
    local cArgs, cExec = table.pack(...), cPromise.resolve
    local payload = {
        name = false,
        type = "emitCallback",
        identifier = network.private.fetchIdentifier(),
        exec = network.private.serializeExec(cExec),
        isRemote = false,
        isRestricted = false,
    }
    if self == network.public then
        payload.name, payload.isRemote = network.private.fetchArg(false, cArgs), network.private.fetchArg(false, cArgs)
        if payload.isRemote then
            payload.isLatent = network.private.fetchArg(false, cArgs)
            if not network.public.isServerInstance then
                payload.isReceiver = localPlayer
            else
                payload.isReceiver = network.private.fetchArg(false, cArgs)
                payload.isReceiver = (payload.isReceiver and imports.isElement(payload.isReceiver) and payload.isReceiver) or false
                if not payload.isReceiver then return false end
            end
        end
    else
        payload.name = self.name
        payload.isRestricted = true
    end
    payload.arguments = cArgs
    if not payload.isRemote then
        --TODO: FIGURE OUT SOMEHOW!!
        ---imports.triggerEvent("vsdk.network:main", resourceRoot, network.private.fetchIdentifier(), payload)
    else
        if not network.public.isServerInstance then imports.network.emit("vsdk.network:main", payload.isLatent, table.encode(payload))
        else imports.network.emit("vsdk.network:main", payload.isReceiver, payload.isLatent, table.encode(payload)) end
    end
    return cPromise
end
