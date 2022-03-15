import {pointCoordsType} from "../misc/types";

export const getCoordsFromString = (coordsString: string): pointCoordsType => {
    // function parses string of type POINT(34.23234523 43.1234124)
    // to array of two numbers or pointCoordsType
    let strAr = coordsString.slice(6, -1).split(' ')
    let reverseCoords = strAr.map(s => Number(s))
    let coords = reverseCoords.reverse()
    return coords as pointCoordsType
}