export type objectType = {
    // тестовый тип объекта
    // itIs - точка, линия, многоугольник
    // массив координат coords совместим с 2gis api
    // [keyName: string]: any для тестовых целей -
    // для совместимости с мок-объектами другого проекта
    // позволяет объекту иметь любые другие неописанные
    // свойства любого типа со строковыми ключами
    id: string,
    coords: coordsType
    itIs: itIsType,
    name: string,
    address: addressType,
    telephone: string,
    square: number,
    squareBorders: coordsType,
    classOfObject: objectClassType,
    [keyName: string]: any,
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
type objectClassType = 'office' | 'storage' | 'shop'