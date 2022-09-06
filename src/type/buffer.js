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

const vKit = require("../")
const private = {}


////////////////////
// Class: Buffer //
////////////////////

// @Desc: Creates a new buffer
vKit.Buffer = (category) => {
    if (!vKit.isString(category)) return false
    if (!private[category]) {
        private[category] = vKit.Class()
        private[category].private.buffer = vKit.Object()
        private[category].public.addMethod("isVoid", (ref) => (vKit.isString(ref) && !private[category].private.buffer.get(ref) && true) || false)
        private[category].public.addMethod("fetch", (ref) => (!private[category].public.isVoid(ref) && private[category].private.buffer.get(ref)) || false)
        private[category].public.addMethod("create", (ref) => {
            if (!private[category].public.isVoid(ref)) return false
            const cInstance = private[category].public.createInstance(ref)
            private.ref = ref
            private[category].private.buffer.set(ref, cInstance)
            return cInstance
        })
        private[category].public.addMethod("destroy", (ref) => {
            if (private[category].public.isVoid(ref)) return false
            return private[category].private.buffer.get(ref).destroy()
        })
        private[category].public.addMethod("constructor", (self, ref) => {})
        private[category].public.addInstanceMethod("destroy", (self) => {
            const private = private[category].instance.get(self)
            private[category].private.buffer.delete(private.ref)
            self.destroyInstance()
            return true
        })
    }
    return private[category]
}