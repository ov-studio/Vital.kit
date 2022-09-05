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

// @Desc: Creates a fresh buffer w/ specified category
CBuffer.public.addMethod("create", (category, ...cArgs) => {
    category = (vKit.isString(category) && !CBuffer.private.buffer.get(category) && category) || false
    if (!category) return false
    const cBuffer = vKit.Class()
    cBuffer.private.buffer = vKit.Object()
    CBuffer.private.buffer.set(category, cBuffer)

    // @Desc: Verifies whether the instance is void
    cBuffer.public.addMethod("isVoid", (ref) => (vKit.isString(ref) && !cBuffer.private.buffer.get(ref) && true) || false)

    // @Desc: Fetches instance instance by ref
    cBuffer.public.addMethod("fetch", (ref) => (!cBuffer.public.isVoid(ref) && cBuffer.private.buffer.get(ref)) || false)

    // @Desc: Creates a fresh instance w/ specified ref
    cBuffer.public.addMethod("create", (ref, ...cArgs) => {
        if (!cBuffer.public.isVoid(ref)) return false
        return cBuffer.public.createInstance(ref, ...cArgs)
    })

    // @Desc: Destroys an existing instance by specified ref
    cBuffer.public.addMethod("destroy", (name) => {
        if (cBuffer.public.isVoid(name)) return false
        return cBuffer.private.buffer.get(name).destroy()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Instance constructor
    cBuffer.public.addMethod("constructor", (self, ref) => {
        const private = cBuffer.instance.get(self)
        private.ref = ref
    })

    // @Desc: Destroys the instance
    cBuffer.public.addInstanceMethod("destroy", (self) => {
        const private = cBuffer.instance.get(self)
        cBuffer.private.buffer.delete(private.ref)
        self.destroyInstance()
        return true
    })
    return cBuffer
})