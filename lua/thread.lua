----------------------------------------------------------------
--[[ Resource: Assetify Library
     Script: utilities: sandbox: thread.lua
     Author: vStudio
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
        thread.private.coroutines[(self.thread)] = self
    end
    return self
end

function thread.public:create_heartbeat(conditionExec, exec, rate)
    if self ~= thread.public then return false end
    if not conditionExec or not exec or (imports.type(conditionExec) ~= "function") or (imports.type(exec) ~= "function") then return false end
    rate = math.max(imports.tonumber(rate) or 0, 1)
    local self = thread.public:create(function(self)
        while(conditionExec()) do
            thread.public:pause()
        end
        exec()
        conditionExec, exec = nil, nil
    end)
    self:resume({executions = 1, frames = rate})
    return self
end

function thread.public:create_promise(callback, config)
    if self ~= thread.public then return false end
    callback = (callback and (imports.type(callback) == "function") and callback) or false
    config = (config and (imports.type(config) == "table") and config) or {}
    config.isAsync = (config.isAsync and true) or false
    config.timeout = imports.tonumber(config.timeout) or false
    config.timeout = (config.timeout and (config.timeout > 0) and config.timeout) or false
    if not callback and config.isAsync then return false end
    local cHandle, cTimer, isHandled = nil, nil, false
    local cPromise = {
        resolve = function(...) return cHandle(true, ...) end,
        reject = function(...) return cHandle(false, ...) end
    }
    cHandle = function(isResolver, ...)
        if not thread.private.promises[cPromise] or isHandled then return false end
        isHandled = true
        if cTimer then cTimer:destroy() end
        timer:create(function(...)
            for i, j in imports.pairs(thread.private.promises[cPromise]) do
                thread.private.resolve(i, isResolver, ...)
            end
            thread.private.promises[cPromise] = nil
            imports.collectgarbage("step", 1)
        end, 1, 1, ...)
        return true
    end
    thread.private.promises[cPromise] = {}
    if not config.isAsync then execFunction(callback, cPromise.resolve, cPromise.reject)
    else thread.public:create(function(self) execFunction(callback, self, cPromise.resolve, cPromise.reject) end):resume() end
    if config.timeout then cTimer = timer:create(function() cPromise.reject("Promise - Timed Out") end, config.timeout, 1) end
    return cPromise
end

function thread.public:destroy()
    if not thread.public:isInstance(self) then return false end
    if self.intervalTimer and timer:isInstance(self.intervalTimer) then self.intervalTimer:destroy() end
    if self.sleepTimer and timer:isInstance(self.sleepTimer) then self.sleepTimer:destroy() end
    thread.private.coroutines[(self.thread)] = nil
    thread.private.exceptions[self] = nil
    self:destroyInstance()
    return true
end

function thread.public:get_thread()
    local currentThread = imports.coroutine.running()
    return (currentThread and thread.private.coroutines[currentThread]) or false
end

function thread.public:status()
    if not thread.public:isInstance(self) then return false end
    return imports.coroutine.status(self.thread)
end

function thread.public:pause()
    if not thread.public:get_thread() then return false end
    return imports.coroutine.yield()
end

function thread.private.resume(self, abortTimer)
    if not thread.public:isInstance(self) or self.isAwaiting then return false end
    if abortTimer then
        if self.intervalTimer and timer:isInstance(self.intervalTimer) then self.intervalTimer:destroy() end
        self.options.executions, self.options.frames = false, false 
    end
    if self:status() == "dead" then self:destroy(); return false end
    if self:status() == "suspended" then imports.coroutine.resume(self.thread, self) end
    if self:status() == "dead" then self:destroy() end
    return true
end

function thread.public:resume(options)
    if not thread.public:isInstance(self) then return false end
    options = (options and (imports.type(options) == "table") and options) or false
    local executions, frames = (options and imports.tonumber(options.executions)) or false, (options and imports.tonumber(options.frames)) or false
    if not executions or not frames then return thread.private.resume(self, true) end
    if self.intervalTimer and timer:isInstance(self.intervalTimer) then self.intervalTimer:destroy() end
    self.options.executions, self.options.frames = executions, frames
    timer:create(function(...)
        if not self.isAwaiting then
            for i = 1, self.options.executions, 1 do
                thread.private.resume(self)
                if not thread.public:isInstance(self) then break end
            end
        end
        if thread.public:isInstance(self) then
            self.intervalTimer = timer:create(function()
                if self.isAwaiting then return false end
                for i = 1, self.options.executions, 1 do
                    thread.private.resume(self)
                    if not thread.public:isInstance(self) then break end
                end
            end, self.options.frames, 0)
        end
    end, 1, 1)
    return true
end

function thread.public:sleep(duration)
    duration = math.max(0, imports.tonumber(duration) or 0)
    if not thread.public:isInstance(self) or (self ~= thread.public:get_thread()) or self.isAwaiting then return false end
    if self.sleepTimer and timer:isInstance(self.sleepTimer) then return false end
    self.isAwaiting = "sleep"
    self.sleepTimer = timer:create(function()
        self.isAwaiting = nil
        thread.private.resume(self)
    end, duration, 1)
    thread.public:pause()
    return true
end

function thread.public:await(cPromise)
    if not thread.public:isInstance(self) or (self ~= thread.public:get_thread()) then return false end
    if not cPromise or not thread.private.promises[cPromise] then return false end
    self.isAwaiting = "promise"
    self.awaitingPromise = cPromise
    thread.private.promises[cPromise][self] = true
    thread.public:pause()
    local resolvedValues = self.resolvedValues
    self.resolvedValues = nil
    if self.isErrored then
        if thread.private.exceptions[self] then
            timer:create(function()
                local exception = thread.private.exceptions[self]
                self:destroy()
                exception.promise.reject(table.unpack(resolvedValues))
                exception.handles.catch(table.unpack(resolvedValues))
            end, 1, 1)
            thread.public:pause()
        end
        return
    else return table.unpack(resolvedValues) end
end

function thread.private.resolve(self, isResolved, ...)
    if not thread.public:isInstance(self) then return false end
    if not self.isAwaiting or (self.isAwaiting ~= "promise") or not thread.private.promises[(self.awaitingPromise)] then return false end
    timer:create(function(...)
        self.isAwaiting, self.awaitingPromise = nil, nil
        self.isErrored = not isResolved
        self.resolvedValues = table.pack(...)
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
    local cException, cCatch, resolvedValues = nil, handles.catch, nil
    handles.catch = function(...) resolvedValues = {cCatch(...)} end
    local exceptionBuffer = {
        promise = thread.public:create_promise(),
        handles = handles
    }
    cException = thread.public:create(function(self)
        resolvedValues = table.pack(exceptionBuffer.handles.exec(self))
        exceptionBuffer.promise.resolve()
    end)
    thread.private.exceptions[cException] = exceptionBuffer
    cException:resume()
    self:await(exceptionBuffer.promise)
    return table.unpack(resolvedValues)
end

function async(...) return thread.public:create(...) end
function heartbeat(...) return thread.public:create_heartbeat(...) end
function promise(...) return thread.public:create_promise(...) end
function sleep(...)
    local currentThread = thread.public:get_thread()
    if not currentThread then return false end
    return currentThread:sleep(...)
end
function await(...)
    local currentThread = thread.public:get_thread()
    if not currentThread then return false end
    return currentThread:await(...)
end
function try(...)
    local currentThread = thread.public:get_thread()
    if not currentThread then return false end
    return currentThread:try(...)
end