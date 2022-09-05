/*----------------------------------------------------------------
     Resource: Vital.kit
     Script: type: buffer.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 04/09/2022
     Desc: Buffer Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const vKit = require("..")


////////////////////
// Class: Buffer //
////////////////////

const CCache = {}

// @Desc: Creates a new dynamic buffer
vKit.Buffer = (category) => {
    if (!vKit.isString(category)) return false
    if (!CCache[category]) {
        CCache[category] = vKit.Class()
        CCache[category].private.buffer = vKit.Object()
        CCache[category].public.addMethod("isVoid", (ref) => (vKit.isString(ref) && !CCache[category].private.buffer.get(ref) && true) || false)
        CCache[category].public.addMethod("fetch", (ref) => (!CCache[category].public.isVoid(ref) && CCache[category].private.buffer.get(ref)) || false)
        CCache[category].public.addMethod("create", (ref) => {
            if (!CCache[category].public.isVoid(ref)) return false
            return CCache[category].public.createInstance(ref)
        })
        CCache[category].public.addMethod("destroy", (ref) => {
            if (CCache[category].public.isVoid(ref)) return false
            return CCache[category].private.buffer.get(ref).destroy()
        })
        CCache[category].public.addMethod("constructor", (self, ref) => {
            const private = CCache[category].instance.get(self)
            private.ref = ref
        })
        CCache[category].public.addInstanceMethod("destroy", (self) => {
            const private = CCache[category].instance.get(self)
            CCache[category].private.buffer.delete(private.ref)
            self.destroyInstance()
            return true
        })
    }
    return CCache[category].public
}