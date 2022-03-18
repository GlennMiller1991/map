export type objectType = {
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
    address: string,
    telephone: string,
    email: string,
    square: string,
    squareBorders: coordsType,
    classOfObject: objectClassType,
}

export type TEditingObjectType = objectType & {
    changeMarkerDraggableMode?: (draggable: boolean) => void,
}

export type coordsType = pointCoordsType[] | Array<pointCoordsType[]>
export type pointCoordsType = [latitudeType, longitudeType]
type latitudeType = number
type longitudeType = number

type itIsType = 'point' | 'line' | 'polygon'
export type objectClassType = 'office' | 'storage' | 'shop' | undefined
export type drawingClassType = 'entrance' | 'square' | 'position' | 'update' | 'nothing' | 'naming'
export type TEditSideBarEditMode = 'create' | 'update'

// 2gis types
export interface IClass {

}
export interface IEvent {
    type: string,
    target: object,
}
export interface IHandler {
    enable: () => void,
    disable: () => void,
    enabled: () => boolean,
    addHooks: () => void,
    removeHooks: () => void,
}

export type TMarker = ILayer & {
    getLatLng: () => TLatLng,
    setLatLng: (coords: TLatLng | pointCoordsType) => void,
    options: {
        interactive: boolean,
        draggable: boolean,
        keyboard: boolean,
        opacity: number,
        alt: string,
        pane: string,
        riseOffset: number,
        riseOnHover: boolean,
        title: string,
        zIndexOffset: number,
    }
}
export interface IPolygon extends IPolyline {}
export interface IPolyline extends IPath {
    toGeoJSON: () => object,
    getLatLngs: () => TLatLng[],
    setLatLngs: (latlngs: TLatLng[]) => IPolyline,
    isEmpty: () => boolean,
    getCenter: () => TLatLng,
    getBounds: () => TLatLngBounds,
    addLatLng: (latlngs: TLatLng | TLatLng[]) => IPolyline,
}
export interface IPath extends ILayer{
    redraw: () => IPath,
    setStyle: (options: TPathOptions) => IPath,
    bringToFront: () => IPath,
    bringToBack: () => IPath,
}
export interface IEvented {
    on: (type: string, context?: object) => void,
    off: (type: string, context?: object) => void,
}
export interface ILayer extends IEvented{
    removeFrom: (obj: {}) => void
}
export type TMap = {
    boxZoom: IHandler,
    doubleClickZoom: IHandler,
    dragging: IHandler,
    keyboard: IHandler,
    scrollWheelZoom: IHandler,
    tap: IHandler,
    touchZoom: IHandler,
    geoclicker: IHandler,
    projectDetector: IHandler,
    zoomControl: unknown,
    fullscreenControl: unknown,
    rulerControl: unknown,
    trafficControl: unknown,
    baseLayer: unknown,
    addLayer: (layer: ILayer) => TMap,
    removeLayer: (layer: ILayer) => TMap,
    hasLayer: (layer: ILayer) => boolean,
    eachLayer: (callback: () => void, context?: object) => TMap,
    openPopup: unknown,
    closePopup: unknown,
    addControl: unknown,
    removeControl: unknown,
    setView: unknown,
    setZoom: unknown,
    zoomIn: unknown,
    zoomOut: unknown,
    setZoomAround: unknown,
    fitBounds: unknown,
    fitWorld: unknown,
    panTo: unknown,
    panBy: (point: TPoint) => TMap,
    setMaxBounds: (bounds: TBounds) => TMap,
    setMinZoom: (zoom: number) => TMap,
    setMaxZoom: (zoom: number) => TMap,
    panInsideBounds: unknown,
    invalidateSize: unknown,
    stop: () => TMap,
    flyTo: unknown,
    flyToBounds: unknown,
    setLang: (lang: TLanguage) => string,
    addHandler: (name: string, handler: IHandler) => TMap,
    remove: () => TMap,
    createPane: (name: string, container?: HTMLElement) => HTMLElement,
    getPane: (pane: string | HTMLElement) => HTMLElement,
    getPanes: () => object,
    getContainer: () => HTMLElement,
    whenReady: (callback: Function, context?: object) => TMap,
    getCenter: () => TLatLng,
    getZoom: () => number,
    getBounds: () => TLatLngBounds,
    getMinZoom: () => number,
    getMaxZoom: () => number,
    getBoundsZoom: (bounds: TLatLngBounds, inside?: boolean) => number,
    getSize: () => TPoint,
    getPixelBounds: () => TBounds,
    getPixelOrigin: () => TPoint,
    getPixelWorldBounds: (zoom?: number) => TBounds,
    getLang: () => TLanguage,
    getZoomScale: (toZoom: number, fromZoom: number) => number,
    getScaleZoom: (scale: number, fromZoom: number) => number,
    project: (latlng: TLatLng, zoom: number) => TPoint,
    unproject: ( point: TPoint, zoom: number) => TLatLng,
    layerPointToLatLng: (point: TPoint) => TLatLng,
    latLngToLayerPoint: (latlng: TLatLng) => TPoint,
    wrapLatLng: (latlng: TLatLng) => TLatLng,
    distance: (latlng1: TLatLng, latlng2: TLatLng) => number,
    containerPointToLayerPoint: (point: TPoint) => TPoint,
    layerPointToContainerPoint: (point: TPoint) => TPoint,
    containerPointToLatLng: (point: TPoint) => TPoint,
    latLngToContainerPoint: (latlng: TLatLng) => TPoint,
    mouseEventToContainerPoint: (event: TMouseEvent) => TPoint,
    mouseEventToLayerPoint: (event: TMouseEvent) => TPoint,
    mouseEventToLatLng: (event: TMouseEvent) => TLatLng,
    locate: (options?: TLocateOptions) => TMap,
    stopLocate: () => TMap,

}
export type TLatLng = {
    lat: number,
    lng: number,
    alt: number,
    toString: () => string,
    distanceTo: (point: TLatLng | pointCoordsType) => number,
    wrap: () => TLatLng,
    toBounds: (sizeInMeters: number) => TLatLngBounds,
}
export type TLatLngBounds = {
    extend: (latLngs: TLatLng | TLatLngBounds) => TLatLngBounds,
    pad: (bufferRatio: number) => TLatLngBounds,
    getCenter: () => TLatLng,
    getSouthWest: () => TLatLng,
    getNorthWest: () => TLatLng,
    getSouthEst: () => TLatLng,
    getNorthEst: () => TLatLng,
    getWest: () => number,
    getEast: () => number,
    getNorth: () => number,
    getSouth: () => number,
    contains: (bounds: TLatLngBounds) => boolean,
    intersects: (bounds: TLatLngBounds) => boolean,
    overlaps: (bounds: TBounds) => boolean,
    toBBoxString: () => string,
    equals: (bounds: TLatLngBounds) => boolean,
    isValid: () => boolean,
}
export type TBounds = {
    min: TPoint,
    max: TPoint,
    extend: (point: TPoint) => TBounds,
    getCenter: (isRound: boolean) => TPoint,
    getBottomLeft: () => TPoint,
    getTopRight: () => TPoint,
    getSize: () => TPoint,
    contains: (bounds: TBounds) => boolean,
    intersects: (bounds: TBounds) => boolean,
    overlaps: (bounds: TBounds) => boolean,
}
export type TPoint = {
    x: number,
    y: number,
    clone: () => TPoint,
    add: (point: TPoint) => TPoint,
    subtract: (point: TPoint) => TPoint,
    scaleBy: (point: TPoint) => TPoint,
    unscaleBy: (point: TPoint) => TPoint,
    divideBy: (num: number) => TPoint,
    multiplyBy: (num: number) => TPoint,
    round: () => TPoint,
    floor: () => TPoint,
    ceil: () => TPoint,
    distanceTo: (point: TPoint) => number,
    equals: (point: TPoint) => boolean,
    contains: (point: TPoint) => boolean,
    toString: () => string,
}
export type TMouseEvent = IEvent & {
    latlng: TLatLng,
    layerPoint: TPoint,
    containerPoint: TPoint,
    originalEvent: MouseEvent
}
export type TDragEndEventTarget = EventTarget & {
    getLatLng: () => TLatLng,
}
export type TDragEndEvent = {
    distance: number,
    target: TDragEndEventTarget,
    type: 'string',
}
export type TLanguage = 'en' | 'ru' | 'it' | 'cs' | 'es' | 'ar'
export type TLocateOptions = Partial<{
    watch: boolean,
    setView: boolean,
    maxZoom: number,
    timeout: number,
    maximumAge: number,
    enableHighAccuracy: boolean,
}>
export type TPathOptions = Partial<{
    stroke: boolean,
    color: string,
    weight: number,
    opacity: number,
    lineCap: TStrokeLineCap,
    lineJoin: TStrokeLineJoin,
    dashArray: string,
    dashOffset: string,
    fill: boolean,
    fillColor: string,
    fillOpacity: number,
    fillRule: 'nonzero' | 'evenodd',
    interactive: boolean,
    renderer: unknown,
    className: string,
}> | TPolylineOptions
export type TPolylineOptions = Partial<{
    smoothFactor: number,
    noClip: boolean,
}>
export type TStrokeLineCap = 'round' | 'butt' | 'square'
export type TStrokeLineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round'