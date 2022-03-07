import {coordsType, objectType} from "../types";

export const getBounds = (objs: objectType[]) => {
    let bounds: coordsType[] = []
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]
        bounds.push(obj.coords)
    }
    return bounds
}