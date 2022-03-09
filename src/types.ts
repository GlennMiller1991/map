export type objectType = {
    // тестовый тип объекта
    // itIs - точка, линия, многоугольник
    // массив координат coords совместим с 2gis api
    // [keyName: string]: any для тестовых целей -
    // для совместимости с мок-объектами другого проекта
    // позволяет объекту иметь любые другие неописанные
    // свойства любого типа со строковыми ключами
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
