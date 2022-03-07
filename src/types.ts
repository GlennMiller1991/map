export type objectType = {
    coords: coordsType
    itIs: itIsType,
    name: string,
    [keyName: string]: any,
}

export type coordsType = pointCoordsType[] | Array<pointCoordsType[]>
export type pointCoordsType = [latitudeType, longitudeType]
type latitudeType = number
type longitudeType = number

type itIsType = 'point' | 'line' | 'polygon'
