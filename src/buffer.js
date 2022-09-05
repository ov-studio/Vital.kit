/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: category.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Buffer Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require(".")


////////////////////
// Class: Buffer //
////////////////////

const CBuffer = vKit.Class()
vKit.buffer = CBuffer.public
CBuffer.private.buffer = vKit.Object()


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a fresh category w/ specified category
CBuffer.public.addMethod("create", (category, ...cArgs) => {
    category = (vKit.isString(category) && !CBuffer.private.buffer.get(category) && category) || false
    if (!category) return false
    const cBuffer = vKit.Class()
    cBuffer.private.buffer = vKit.Object()
    CBuffer.private.buffer.set(category, cBuffer)

    // @Desc: Verifies whether the category is void
    cBuffer.public.addMethod("isVoid", (category) => (vKit.isString(category) && !cBuffer.private.buffer.get(category) && true) || false)

    // @Desc: Fetches category instance by category
    cBuffer.public.addMethod("fetch", (category) => (!cBuffer.public.isVoid(category) && cBuffer.private.buffer.get(category)) || false)

    // @Desc: Creates a fresh category w/ specified category
    cBuffer.public.addMethod("create", (name, ...cArgs) => {
        if (!cBuffer.public.isVoid(name)) return false
        const cInstance = cBuffer.public.createInstance(name, ...cArgs)
        cBuffer.private.buffer.set(name, cInstance)
        return cInstance
    })

    // @Desc: Destroys an existing category by specified category
    cBuffer.public.addMethod("destroy", (name) => {
        if (cBuffer.public.isVoid(name)) return false
        return cBuffer.private.buffer.get(name).destroy()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Instance constructor
    cBuffer.public.addMethod("constructor", (self, category) => {
        const private = cBuffer.instance.get(self)
        private.category = category
    })

    // @Desc: Destroys the instance
    cBuffer.public.addInstanceMethod("destroy", (self) => {
        const private = cBuffer.instance.get(self)
        cBuffer.private.buffer.delete(private.category)
        self.destroyInstance()
        return true
    })
    return cBuffer
})