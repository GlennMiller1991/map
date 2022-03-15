import {coordsType, objectType} from "../misc/types";

export const getBounds = (objs: objectType[]) => {
    // функция-хелпер
    // возвращает массив координат в виде coordsType[]
    // совместимых с 2gis api
    // используется для получения привязок карты и
    // корректировки значения zoom карты
    let bounds: coordsType[] = []
    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]
        bounds.push(obj.coords)
    }
    return bounds
}