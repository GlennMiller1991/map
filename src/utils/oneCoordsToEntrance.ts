import {TLatLng} from "../misc/types";

export const oneCoordsToEntrance = (coords: TLatLng) => {
    return `LINESTRING(${coords.lng} ${coords.lat + .0001}, ${coords.lng} ${coords.lat})`
}