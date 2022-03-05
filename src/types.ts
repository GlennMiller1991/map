export type objectType = {
    coords: latLngType[],
    itIs: itIsType,
    name: string,
    [keyName: string]: any,
}

type latLngType = {
    lat: number,
    lng: number,
}

type itIsType = 'point' | 'line' | 'polygon'
