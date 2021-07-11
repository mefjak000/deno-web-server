import USID from "https://deno.land/x/usid/mod.ts";

const usid = new USID()

// Default length
const len = 7

export const rand_sid = usid.rand(len)