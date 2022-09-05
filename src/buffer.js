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

const CCache = vKit.Object()

// @Desc: Creates a new dynamic buffer
vKit.Buffer = (category) => {
    if (!vKit.isString(category)) return false
    var cBuffer = CCache.get(category)
    if (cBuffer) return cBuffer
    cBuffer = vKit.Class()
    cBuffer.private.buffer = vKit.Object()
    CCache.set(category, cBuffer)

    // @Desc: Verifies whether the instance is void
    cBuffer.public.addMethod("isVoid", (ref) => (vKit.isString(ref) && !cBuffer.private.buffer.get(ref) && true) || false)

    // @Desc: Fetches instance by ref
    cBuffer.public.addMethod("fetch", (ref) => (!cBuffer.public.isVoid(ref) && cBuffer.private.buffer.get(ref)) || false)

    // @Desc: Creates a fresh instance w/ specified ref
    cBuffer.public.addMethod("create", (ref) => {
        if (!cBuffer.public.isVoid(ref)) return false
        return cBuffer.public.createInstance(ref)
    })

    // @Desc: Destroys an existing instance by specified ref
    cBuffer.public.addMethod("destroy", (ref) => {
        if (cBuffer.public.isVoid(ref)) return false
        return cBuffer.private.buffer.get(ref).destroy()
    })

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
    return cBuffer.public
})