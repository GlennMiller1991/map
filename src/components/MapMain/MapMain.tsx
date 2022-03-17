import React, {useEffect, useRef, useState} from "react";
import {
    drawingClassType,
    objectType,
    pointCoordsType,
    TDragEndEvent,
    TEditingObjectType,
} from "../../misc/types";
import {getBounds} from "../../utils/getBounds";
import EventEmitter from "events";
import arrow from '../../imgs/arrow.png';
import {fakeObject} from "../../App";
import {doubleGisRestApi, TSearchResponse} from "../../rest_api/restApi";
import {
    EVENT__CHANGE_DRAW_MODE, EVENT__CHANGE_EDIT_MODE,
    EVENT__REFRESH_OBJECT_PROPERTIES,
    RESPONSE__SUCCESS
} from "../../misc/constants";

const DG = require('2gis-maps');
const entrancePic = DG.icon({
    iconUrl: arrow,
    iconSize: [30, 30]
});

type TMapMainProps = {
    emitterMap: EventEmitter,
    emitterSideBar: EventEmitter,
    objs: objectType[],
    editMode: boolean,
    createObject: (obj: TEditingObjectType) => void,
    setError: (error: string) => void,
    error: string,
}
export const MapMain: React.FC<TMapMainProps> = React.memo((props) => {
        console.log('from map main')

        //state
        const [map, setMap] = useState(null)

        // доступ к актуальным данным расположенных на карте объектов не через useState
        let currentObjectsOnMap = useRef<any[]>([])
        let currentEditMode = useRef<boolean>(props.editMode)
        let currentEditingObjectOnMap = useRef<any>(null)
        let currentDrawClass = useRef<drawingClassType>("nothing")
        let currentEntrance = useRef<any>(null)
        let currentSquare = useRef<any>(null)
        let currentEditingObjectMarkerPosition = useRef<any>(null)

        const createObj = (event: any, map: any) => {
            //create object by click

            if (currentEditingObjectOnMap.current) {
                // delete previous object from map
                currentEditingObjectOnMap.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]

            doubleGisRestApi.getAddress(latLng as pointCoordsType)
                // get address by coords of click
                // if code 200 (success) get full address name or address name or name
                // else set error
                .then((response: TSearchResponse) => {
                    if (response.meta.code === RESPONSE__SUCCESS) {
                        let address: string
                        let name: string
                        let id: string
                        address = response.result.items[0].full_address_name ? response.result.items[0].full_address_name : ''
                        name = response.result.items[0].name ? response.result.items[0].name : ''
                        id = response.result.items[0].id
                        props.setError('')
                        props.createObject({
                            ...fakeObject,
                            coords: latLng,
                            address,
                            name,
                            id,
                        })
                    } else {
                        props.createObject(fakeObject)
                        props.setError('Здание не найдено')
                    }
                })
            debugger
            const marker = DG.marker(latLng).addTo(map);
            currentEditingObjectOnMap.current = marker
            currentObjectsOnMap.current.push(marker)
        }
        const createEntrance = (event: any, map: any) => {
            if (currentEntrance.current) {
                currentEntrance.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]
            let marker = DG.marker([...latLng], {icon: entrancePic, opacity: 0.6}).addTo(map);
            currentObjectsOnMap.current.push(marker)
            currentEntrance.current = marker
            props.emitterMap.emit(EVENT__REFRESH_OBJECT_PROPERTIES, {entranceCoords: latLng})
        }
        const createSquare = (event: any, map: any) => {
            if (currentSquare.current) {
                let latLng = [event.latlng.lat, event.latlng.lng]
                currentSquare.current.addLatLng(latLng)
                props.emitterMap.emit(
                    EVENT__REFRESH_OBJECT_PROPERTIES,
                    {
                        squareBorders: currentSquare.current.getLatLngs()[0].map((coords: any) => [coords.lat, coords.lng]),
                    }
                )
            } else {
                let latLng = [event.latlng.lat, event.latlng.lng]
                let square = DG.polygon([latLng]).addTo(map)
                currentSquare.current = square
                currentObjectsOnMap.current.push(square)
            }
        }

        useEffect(() => {
            // данная структура позволяет реакту отрисовывать только
            // контейнер карты, не пересоздавая саму карту даже при изменении стейта
            if (map) {
                // если карта создана
                if (currentObjectsOnMap.current.length) {
                    // если есть объекты на карте - удалить
                    currentObjectsOnMap.current.forEach((marker) => {
                        marker.removeFrom(map)
                    })
                }
                if (props.objs.length) {
                    // useEffect реагирует на изменение переданного массива объектов в компоненту
                    //
                    // если они есть и изменились
                    let newObjects: any[] = []
                    props.objs.forEach((obj) => {
                        // то прикрепляем к карте
                        let objectToMap: any

                        // точка, линия или многоугольник?
                        // под каждое значение 2gis предоставляет свой инструмент
                        // создания рендерящихся объектов
                        if (obj.itIs === 'point') {
                            objectToMap = DG.marker(obj.coords).addTo(map)
                            objectToMap.on('click', () => {
                                if (currentSquare.current) {
                                    currentSquare.current.removeFrom(map)
                                }
                                if (currentEntrance.current) {
                                    currentEntrance.current.removeFrom(map)
                                }
                                if (currentEditingObjectOnMap.current) {
                                    currentEditingObjectOnMap.current.removeFrom(map)
                                }
                                if (currentEditMode.current) {
                                    const changeMarkerDraggableMode = (draggable: boolean) => {
                                        objectToMap?.removeFrom(map)
                                        if (draggable) {
                                            let newMarker: any
                                            if (!currentEditingObjectMarkerPosition.current) {
                                                newMarker = DG.marker(obj.coords, {
                                                    draggable,
                                                }).addTo(map)
                                            } else {
                                                let coords = currentEditingObjectMarkerPosition.current.getLatLng()
                                                currentEditingObjectMarkerPosition.current.removeFrom(map)
                                                newMarker = DG.marker(coords, {
                                                    draggable,
                                                }).addTo(map)
                                            }
                                            currentEditingObjectMarkerPosition.current = newMarker
                                            newMarker.on('dragend', async (event: TDragEndEvent) => {
                                                let newLatLngObj = event.target.getLatLng()
                                                let coords = [newLatLngObj.lat, newLatLngObj.lng]
                                                let response = await doubleGisRestApi.getAddress(coords as pointCoordsType)
                                                if (response.meta.code === RESPONSE__SUCCESS) {
                                                    let address: string
                                                    let id: string
                                                    address = response.result.items[0].full_address_name ? response.result.items[0].full_address_name : ''
                                                    id = response.result.items[0].id
                                                    props.setError('')
                                                    props.emitterMap.emit(EVENT__REFRESH_OBJECT_PROPERTIES, {
                                                        address,
                                                        id,
                                                        coords
                                                    })
                                                } else {
                                                    props.setError('Здание не найдено')
                                                    newMarker.setLatLng(obj.coords)
                                                }
                                            })
                                        } else if (!draggable && currentEditingObjectMarkerPosition.current) {
                                            let coords = currentEditingObjectMarkerPosition.current.getLatLng()
                                            currentEditingObjectMarkerPosition.current.removeFrom(map)
                                            currentEditingObjectMarkerPosition.current = DG.marker(coords).addTo(map)
                                        }
                                    }
                                    let editingObj = obj as TEditingObjectType
                                    editingObj.changeMarkerDraggableMode = changeMarkerDraggableMode
                                    props.createObject(editingObj);
                                }
                            })
                        } else if (obj.itIs === 'line') {
                            objectToMap = DG.polyline(obj.coords).addTo(map)
                        } else if (obj.itIs === 'polygon') {
                            objectToMap = DG.polygon(obj.coords).addTo(map)
                        }

                        newObjects.push(objectToMap)
                        if (obj.entranceCoords && obj.entranceCoords.length) {
                            let latLng = obj.entranceCoords
                            let marker = DG.marker(latLng, {icon: entrancePic, opacity: 0.6}).addTo(map);
                            newObjects.push(marker)
                        }
                        if (obj.squareBorders && obj.squareBorders.length) {
                            let square = DG.polygon(obj.squareBorders).addTo(map)
                            newObjects.push(square)
                        }
                    })
                    //@ts-ignore
                    // корректируем зум карты на основании актуальных координат
                    map.flyToBounds(getBounds(props.objs))

                    // сохраняем отрисованные объекты для последующего удаления
                    currentObjectsOnMap.current = newObjects
                }
            }
        }, [props.objs, map])
        useEffect(() => {
            currentEditMode.current = props.editMode
            if (map) {
                if (currentEditingObjectMarkerPosition.current) {
                    currentEditingObjectMarkerPosition.current.removeFrom(map)
                    currentEditingObjectMarkerPosition.current = null
                }
                if (currentEntrance.current) {
                    currentEntrance.current.removeFrom(map)
                    currentEntrance.current = null
                }
                if (currentSquare.current) {
                    currentSquare.current.removeFrom(map)
                    currentSquare.current = null
                }
                if (currentEditingObjectOnMap.current) {
                    currentEditingObjectOnMap.current.removeFrom(map)
                    currentEditingObjectOnMap.current = null
                }
            }
        }, [map, props.editMode])
        useEffect(() => {
            props.emitterSideBar.on(EVENT__CHANGE_DRAW_MODE, (drawMode: drawingClassType) => {
                currentDrawClass.current = drawMode
                if (drawMode === 'square' && currentSquare.current) {
                    currentSquare.current.removeFrom(map)
                    currentSquare.current = null
                }
            })
            props.emitterSideBar.on('createMarker', (coords: pointCoordsType) => {
                createObj({latlng: {lat: coords[0], lng: coords[1]}}, map)
            })
            props.emitterSideBar.on(EVENT__CHANGE_EDIT_MODE, () => {
                if (currentEditingObjectOnMap.current) {
                    currentEditingObjectOnMap.current.removeFrom(map)
                    currentEditingObjectOnMap.current = null
                }
                if (currentEditingObjectMarkerPosition.current) {
                    currentEditingObjectMarkerPosition.current.removeFrom(map)
                    currentEditingObjectMarkerPosition.current = null
                }
                if (currentEntrance.current) {
                    currentEntrance.current.removeFrom(map)
                    currentEntrance.current = null
                }
                if (currentSquare.current) {
                    currentSquare.current.removeFrom(map)
                    currentSquare.current = null
                }
            })

            return () => {
                props.emitterSideBar.removeAllListeners()
            }
        }, [props.emitterSideBar, map])

        return (
            <>
                <div id="map"
                     style={{width: '100%', height: '100%'}}
                     ref={(node) => {
                         if (node) {
                             // если контейнер карты отрендерен
                             if (!map) {
                                 // но объект карты ещё не создан
                                 let mapElem = DG.map('map', {
                                     // зум и центр тестовый, Москва
                                     'center': [55.754753, 37.620861],
                                     'zoom': 9,
                                 })
                                 mapElem.on('click', (event: any) => {
                                     if (currentEditMode.current && currentDrawClass.current && currentDrawClass.current !== 'nothing') {
                                         debugger
                                         if (currentDrawClass.current === 'position') {
                                             createObj(event, mapElem)
                                         } else if (currentDrawClass.current === 'entrance') {
                                             createEntrance(event, mapElem)
                                         } else if (currentDrawClass.current === 'square') {
                                             createSquare(event, mapElem)
                                         }
                                     }
                                 })
                                 setMap(mapElem)
                                 // сохраняем карту в state
                             }
                         }
                     }}>
                </div>
            </>
        )
    }
)