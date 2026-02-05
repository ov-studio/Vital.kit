----------------------------------------------------------------
--[[ Resource: Vital.sandbox
     Script: Module: Lua: resource.lua
     Author: ov-studio
     Developer(s): Aviril, Tron, Mario, Аниса, A-Variakojiene
     DOC: 14/09/2022
     Desc: Resource Utils ]]--
----------------------------------------------------------------


-----------------
--[[ Imports ]]--
-----------------

local imports = {
    type = type,
    pairs = pairs,
    debug = debug
}
debug = nil


-------------------------
--[[ Class: Resource ]]--
-------------------------

local resource = class:create("resource")
resource.private.buffer = {}
resource.private.globals = {
    namespace = namespace,
    thread = thread,
    timer = timer,
    table = table,
    math = math,
    string = string,
    engine = engine,
    crypto = crypto,
    file = file,
    sound = sound
}

function resource.private.fetch(name)
    return resource.private.buffer[name] or false
end

function resource.private.setENV(exec, env)
    local i = 1
    while true do
        local name = imports.debug.getupvalue(exec, i)
        if name == "_ENV" then
            imports.debug.upvaluejoin(exec, i, function() return env end, 1)
            break
        elseif not name then break end
        i = i + 1
    end
    return exec
end

function resource.private.getENV(exec)
    local i = 1
    while true do
        local name, env = imports.debug.getupvalue(exec, i)
        if name == "_ENV" then return env
        elseif not name then break end
        i = i + 1
    end
    return false
end

function resource.public:create(...)
    local cResource = resource.private.fetch(...) or self:createInstance()
    if cResource and not cResource:load(...) then
        cResource:destroyInstance()
        return false
    end
    return cResource
end

function resource.public:destroy(...)
    if not resource.public:isInstance(self) then return false end
    return self:unload(...)
end

function resource.public:load(name)
    if not resource.public:isInstance(self) then return false end
    self.rw = {
        env = table.clone(resource.private.globals, true),
        manifest = table.decode(file.read("resources/"..name.."/manifest.yaml")),
        entity = {}
    }
    --iprint(self.rw.manifest)
    if self.rw.manifest and self.rw.manifest.scripts and (imports.type(self.rw.manifest.scripts) == "table") then
        self.rw.isLoaded = true
        for i, j in imports.pairs(self.rw.manifest.scripts) do
            local isValid = false
            local rwScript = file.read(self.rw.manifest.scripts)
            if rwScript then
                local rwHandle = engine.loadString(rwScript, false)
                isValid = (rwHandler and true) or false
                if  isValid then resource.private.setENV(rwHandle, self.rw.env) end
            end
            if not isValid then
                self.rw.isLoaded = false
                break
            end
        end
    end
    return (self.rw.isLoaded and self) or false
end

function resource.public:unload()
    if not resource.public:isInstance(self) then return false end
    resource.private.buffer[(self.name)] = nil
    self:destroyInstance()
    return true
end