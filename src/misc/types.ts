export type objectType = {
    // тестовый тип объекта
    // itIs - точка, линия, многоугольник
    // массив координат coords совместим с 2gis api
    // [keyName: string]: any для тестовых целей -
    // для совместимости с мок-объектами другого проекта
    // позволяет объекту иметь любые другие неописанные
    // свойства любого типа со строковыми ключами
    id: string,
    coords: coordsType,
    entranceCoords: null | coordsType,
    itIs: itIsType,
    name: string,
    address: string, //addressType,
    telephone: string,
    email: string,
    square: string,
    squareBorders: coordsType,
    classOfObject: objectClassType,
    [keyName: string]: any,
}

export type TEditingObjectType = objectType & {
    makeMarkerDraggable?: () => void,
}


export type addressType = {
    city: string,
    street: string,
    building: number,
    office: number,
}
export type coordsType = pointCoordsType[] | Array<pointCoordsType[]>
export type pointCoordsType = [latitudeType, longitudeType]
type latitudeType = number
type longitudeType = number

type itIsType = 'point' | 'line' | 'polygon'
export type objectClassType = 'office' | 'storage' | 'shop' | undefined
export type drawingClassType = 'entrance' | 'square' |'position' | 'update' | 'nothing' | 'naming'

// 2gis types
export type TLatLng = {
    lat: number,
    lng: number,
}

export type TDragEndEventTarget = EventTarget & {
    getLatLng: () => TLatLng,
}
export type TDragEndEvent = {
    distance: number,
    target: TDragEndEventTarget,
    type: 'string',
}
