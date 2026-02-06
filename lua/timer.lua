----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: Module: Lua: timer.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Timer Utils ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    tonumber = tonumber,
    coroutine = coroutine
}
coroutine = nil


----------------------
--[[ Class: Timer ]]--
----------------------

local timer = class:create("timer")

function timer.public:create(...)
    local self = self:create_instance()
    if self and not self:load(...) then
        self:destroy_instance()
        return false
    end
    return self
end

function timer.public:destroy(...)
    if not timer.public:is_instance(self) then return false end
    return self:unload(...)
end

function timer.public:load(exec, interval, executions, ...)
    if not timer.public:is_instance(self) then return false end
    interval, executions = imports.tonumber(interval), imports.tonumber(executions)
    if not exec or (imports.type(exec) ~= "function") or not interval or not executions then return false end
    interval, executions = math.max(1, interval), math.max(0, executions)
    self.exec = exec
    self.counter = 0
    self.interval, self.executions = interval, executions
    self.arguments = table.pack(...)
    imports.coroutine.resume(imports.coroutine.create(function()
        while ((self.executions == 0) or (self.counter < self.executions)) do
            imports.coroutine.sleep(self.interval)
            if not timer.public:is_instance(self) then return false end
            self.counter = self.counter + 1
            if (self.executions > 0) and (self.counter >= self.executions) then
                self:destroy()
            end
            self.exec(table.unpack(self.arguments))
        end
    end))
    return self
end

function timer.public:unload()
    if not timer.public:is_instance(self) then return false end
    self:destroy_instance()
    return true
end
