----------------------------------------------------------------
--[[ Resource: Assetify Library
     Script: utilities: sandbox: thread.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса
     DOC: 19/10/2021
     Desc: Thread Utilities ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    pairs = pairs,
    tonumber = tonumber,
    collectgarbage = collectgarbage,
    coroutine = coroutine
}


-----------------------
--[[ Class: Thread ]]--
-----------------------

local thread = class:create("thread")
thread.private.coroutines = {}
thread.private.promises = {}
thread.private.exceptions = {}

function execFunction(exec, ...)
    if not exec or (imports.type(exec) ~= "function") then
        return false
    end
    return exec(...)
end

function thread.public:create(exec)
    if self ~= thread.public then return false end
    if not exec or (imports.type(exec) ~= "function") then return false end
    local self = self:createInstance()
    if self then
        self.options = {}
        self.thread = imports.coroutine.create(exec)
        thread.private.coroutines[self.thread] = self
    end
    return self
end

function thread.public:create_heartbeat(condition, exec, rate)
    if self ~= thread.public then return false end
    if not condition or not exec or (imports.type(condition) ~= "function") or (imports.type(exec) ~= "function") then return false end
    rate = math.max(imports.tonumber(rate) or 0, 1)
    local self = thread.public:create(function(self)
        while(condition()) do
            thread.public:pause()
        end
        exec()
        condition, exec = nil, nil
    end)
    self:resume({executions = 1, interval = rate})
    return self
end

function thread.public:create_promise(callback, config)
    if self ~= thread.public then return false end
    callback = (callback and (imports.type(callback) == "function") and callback) or false
    config = (config and (imports.type(config) == "table") and config) or {}
    config.async = (config.async and true) or false
    config.timeout = imports.tonumber(config.timeout) or false
    config.timeout = (config.timeout and (config.timeout > 0) and config.timeout) or false
    if not callback and config.async then return false end
    local handle, handled, timeout_timer = nil, false, nil
    local promise = {
        resolve = function(...) return handle(true, ...) end,
        reject = function(...) return handle(false, ...) end
    }
    handle = function(state, ...)
        if not thread.private.promises[promise] or handled then return false end
        handled = true
        if timeout_timer then timeout_timer:destroy() end
        timer:create(function(...)
            for i, j in imports.pairs(thread.private.promises[promise]) do
                thread.private.resolve(i, state, ...)
            end
            thread.private.promises[promise] = nil
            imports.collectgarbage("step", 1)
        end, 1, 1, ...)
        return true
    end
    thread.private.promises[promise] = {}
    if not config.async then execFunction(callback, promise.resolve, promise.reject)
    else thread.public:create(function(self) execFunction(callback, self, promise.resolve, promise.reject) end):resume() end
    if config.timeout then timeout_timer = timer:create(function() promise.reject("Promise - Timed Out") end, config.timeout, 1) end
    return promise
end

function thread.public:destroy()
    if not thread.public:isInstance(self) then return false end
    if self.interval_timer and timer:isInstance(self.interval_timer) then self.interval_timer:destroy() end
    if self.sleep_timer and timer:isInstance(self.sleep_timer) then self.sleep_timer:destroy() end
    thread.private.coroutines[self.thread] = nil
    thread.private.exceptions[self] = nil
    self:destroyInstance()
    return true
end

function thread.public:get_thread()
    local coroutine = imports.coroutine.running()
    return (coroutine and thread.private.coroutines[coroutine]) or false
end

function thread.public:status()
    if not thread.public:isInstance(self) then return false end
    return imports.coroutine.status(self.thread)
end

function thread.public:pause()
    if not thread.public:get_thread() then return false end
    return imports.coroutine.yield()
end

function thread.private.resume(self, abort_timer)
    if not thread.public:isInstance(self) or self.awaiting then return false end
    if abort_timer then
        if self.interval_timer and timer:isInstance(self.interval_timer) then self.interval_timer:destroy() end
        self.options.executions, self.options.interval = false, false 
    end
    if self:status() == "dead" then self:destroy(); return false end
    if self:status() == "suspended" then imports.coroutine.resume(self.thread, self) end
    if self:status() == "dead" then self:destroy() end
    return true
end

function thread.public:resume(options)
    if not thread.public:isInstance(self) then return false end
    options = (options and (imports.type(options) == "table") and options) or false
    local executions, interval = (options and imports.tonumber(options.executions)) or false, (options and imports.tonumber(options.interval)) or false
    if not executions or not interval then return thread.private.resume(self, true) end
    if self.interval_timer and timer:isInstance(self.interval_timer) then self.interval_timer:destroy() end
    self.options.executions, self.options.interval = executions, interval
    timer:create(function(...)
        if not self.awaiting then
            for i = 1, self.options.executions, 1 do
                thread.private.resume(self)
                if not thread.public:isInstance(self) then break end
            end
        end
        if thread.public:isInstance(self) then
            self.interval_timer = timer:create(function()
                if self.awaiting then return false end
                for i = 1, self.options.executions, 1 do
                    thread.private.resume(self)
                    if not thread.public:isInstance(self) then break end
                end
            end, self.options.interval, 0)
        end
    end, 1, 1)
    return true
end

function thread.public:sleep(duration)
    duration = math.max(0, imports.tonumber(duration) or 0)
    if not thread.public:isInstance(self) or (self ~= thread.public:get_thread()) or self.awaiting then return false end
    if self.sleep_timer and timer:isInstance(self.sleep_timer) then return false end
    self.awaiting = "sleep"
    self.sleep_timer = timer:create(function()
        self.awaiting = nil
        thread.private.resume(self)
    end, duration, 1)
    thread.public:pause()
    return true
end

function thread.public:await(promise)
    if not thread.public:isInstance(self) or (self ~= thread.public:get_thread()) then return false end
    if not promise or not thread.private.promises[promise] then return false end
    self.awaiting = "promise"
    self.awaiting_promise = promise
    thread.private.promises[promise][self] = true
    thread.public:pause()
    local resolved = self.resolved
    self.resolved = nil
    if self.errored then
        if thread.private.exceptions[self] then
            timer:create(function()
                local exception = thread.private.exceptions[self]
                self:destroy()
                exception.promise.reject(table.unpack(resolved))
                exception.handles.catch(table.unpack(resolved))
            end, 1, 1)
            thread.public:pause()
        end
        return
    else return table.unpack(resolved) end
end

function thread.private.resolve(self, state, ...)
    if not thread.public:isInstance(self) then return false end
    if not self.awaiting or (self.awaiting ~= "promise") or not thread.private.promises[self.awaiting_promise] then return false end
    timer:create(function(...)
        self.awaiting, self.awaiting_promise = nil, nil
        self.errored = not state
        self.resolved = table.pack(...)
        thread.private.resume(self)
    end, 1, 1, ...)
    return true
end

function thread.public:try(handles)
    if not thread.public:isInstance(self) or (self ~= thread.public:get_thread()) then return false end
    handles = (handles and (imports.type(handles) == "table") and handles) or false
    handles.exec = (handles.exec and (imports.type(handles.exec) == "function") and handles.exec) or false
    handles.catch = (handles.catch and (imports.type(handles.catch) == "function") and handles.catch) or false
    if not handles.exec or not handles.catch then return false end
    local exception, catch, resolved = nil, handles.catch, nil
    handles.catch = function(...) resolved = {catch(...)} end
    local buffer = {
        promise = thread.public:create_promise(),
        handles = handles
    }
    exception = thread.public:create(function(self)
        resolved = table.pack(buffer.handles.exec(self))
        buffer.promise.resolve()
    end)
    thread.private.exceptions[exception] = buffer
    exception:resume()
    self:await(buffer.promise)
    return table.unpack(resolved)
end


-----------------
--[[ Aliases ]]--
-----------------

function async(...) return thread.public:create(...) end
function heartbeat(...) return thread.public:create_heartbeat(...) end
function promise(...) return thread.public:create_promise(...) end

function sleep(...)
    local self = thread.public:get_thread()
    if not self then return false end
    return self:sleep(...)
end

function await(...)
    local self = thread.public:get_thread()
    if not self then return false end
    return self:await(...)
end

function try(...)
    local self = thread.public:get_thread()
    if not self then return false end
    return self:try(...)
end