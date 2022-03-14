import {coordsType, pointCoordsType} from "../types";

export const coordsToString = (coords: pointCoordsType) => {
    // perform array with two values of number type to string
    let coordsString = `${coords[1]},${coords[0]}`
    return coordsString
}