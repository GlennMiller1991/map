import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    drawingClassType,
    objectType,
    pointCoordsType,
    TDragEndEvent,
    TEditingObjectType, TMarker,
} from "../../misc/types";
import {getBounds} from "../../utils/getBounds";
import EventEmitter from "events";
import arrow from '../../imgs/arrow.png';
import {fakeObject} from "../../App";
import {doubleGisRestApi, TSearchResponse} from "../../rest_api/restApi";
import {
    EVENT__CHANGE_DRAW_MODE, EVENT__CHANGE_EDIT_MODE, EVENT__CREATE_MARKER,
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
}
export const MapMain: React.FC<TMapMainProps> = React.memo(({
    setError, createObject, ...props
                                                            }) => {
        //state
        const [map, setMap] = useState(null)

        // доступ к актуальным данным расположенных на карте объектов не через useState
        // all rendered objects on map
        let currentObjectsOnMap = useRef<TMarker[]>([])

        // is edit bar opened?
        let currentEditMode = useRef<boolean>(props.editMode)

        // marker of new(!) object located in edit bar
        let currentEditingObjectOnMap = useRef<any>(null)

        // marker of old(!) object located in edit bar
        let currentEditingObjectMarkerPosition = useRef<any>(null)

        // what does we drawing now - position, entrance, square, line?
        let currentDrawClass = useRef<drawingClassType>("nothing")

        // new entrance of object in editing bar
        let currentEntrance = useRef<any>(null)

        // new square of obbject in editing bar
        let currentSquare = useRef<any>(null)

        // functions
        const removeUnsavedObjectsFromMap = useCallback(() => {
            // concept is
            // if we are changing edit mode in app component (show/hide edit bar)
            // or in edit bar (create/update object)
            // we need to delete all unsaved objects from map.
            // There (app, sidebar) we are invoking refresh state with render
            // but here we need to sweep out all garbage manually
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
        }, [map])
        const createMarker = useCallback((event: any, map: any) => {
            // create object by click
            // is invoked only if edit bar is shown
            // and only if create mode in edit bar
            // and only if position draw mode

            if (currentEditingObjectOnMap.current) {
                // delete previous object from map
                currentEditingObjectOnMap.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]

            doubleGisRestApi.getAddress(latLng as pointCoordsType)
                // get address by coords of click
                // if code 200 (success) get full address name or address name or name and create new object
                // else set error
                .then((response: TSearchResponse) => {
                    if (response.meta.code === RESPONSE__SUCCESS) {
                        let address: string
                        let name: string
                        let id: string
                        address = response.result.items[0].full_address_name ? response.result.items[0].full_address_name : ''
                        name = response.result.items[0].name ? response.result.items[0].name : ''
                        id = response.result.items[0].id
                        setError('')
                        createObject({
                            ...fakeObject,
                            coords: latLng,
                            address,
                            name,
                            id,
                        })
                    } else {
                        createObject(fakeObject)
                        setError('Здание не найдено')
                    }
                })
                .catch() // not implemented yet!!!!!!!!1

            // create marker regardless on getAddress result
            const marker = DG.marker(latLng).addTo(map);
            // save it in single obj state
            currentEditingObjectOnMap.current = marker
            // save it in multiple obj state
            currentObjectsOnMap.current.push(marker)
        }, [setError, createObject])
        const createEntrance = useCallback((event: any, map: any) => {
            // is invoked only if edit bar is shown
            // and only if we are in entrance draw mode

            if (currentEntrance.current) {
                // remove old entrance from map
                currentEntrance.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]

            // set new marker with our icon on map
            let marker = DG.marker([...latLng], {icon: entrancePic, opacity: 0.6}).addTo(map);
            // save it in multiple obj state
            currentObjectsOnMap.current.push(marker)
            // save it in single entrance state
            currentEntrance.current = marker
            // return control to edit bar with new coords of entrance
            props.emitterMap.emit(EVENT__REFRESH_OBJECT_PROPERTIES, {entranceCoords: latLng})
        }, [props.emitterMap])
        const createSquare = useCallback((event: any, map: any) => {
            // is invoked only if edit bar is shown
            // and only in square draw mode

            if (currentSquare.current) {
                // if already exist
                // add point to square
                // then take control back to edit bar with new square coords array
                let latLng = [event.latlng.lat, event.latlng.lng]
                currentSquare.current.addLatLng(latLng)
                props.emitterMap.emit(
                    EVENT__REFRESH_OBJECT_PROPERTIES,
                    {
                        squareBorders: currentSquare.current.getLatLngs()[0].map((coords: any) => [coords.lat, coords.lng]),
                    }
                )
            } else {
                // if not exist
                // create new square
                let latLng = [event.latlng.lat, event.latlng.lng]
                let square = DG.polygon([latLng]).addTo(map)
                // save it in single square state
                currentSquare.current = square
                // save it in multiple square state
                currentObjectsOnMap.current.push(square)
            }
        }, [props.emitterMap])

        // use effects
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
                                // click on marker change edit and draw mode in edit bar
                                // so need to delete unsaved objects
                                removeUnsavedObjectsFromMap()
                                if (currentEditMode.current) {
                                    // if click in edit mode
                                    // then need to throw function that make marker draggable
                                    // and handle change of marker position through

                                    // so define function
                                    const changeMarkerDraggableMode = (draggable: boolean) => {
                                        // delete first object from map
                                        objectToMap?.removeFrom(map)

                                        if (draggable) {
                                            // if position update mode in edit bar
                                            let newMarker: any
                                            if (!currentEditingObjectMarkerPosition.current) {
                                                // if first edit try
                                                // just create draggable marker instead of deleted
                                                newMarker = DG.marker(obj.coords, {
                                                    draggable,
                                                }).addTo(map)
                                            } else {
                                                // if not first edit try
                                                // make draggable existing marker
                                                let coords = currentEditingObjectMarkerPosition.current.getLatLng()
                                                currentEditingObjectMarkerPosition.current.removeFrom(map)
                                                newMarker = DG.marker(coords, {
                                                    draggable,
                                                }).addTo(map)
                                            }
                                            // save in single obj state
                                            currentEditingObjectMarkerPosition.current = newMarker
                                            // listen to end of drag marker
                                            newMarker.on('dragend', async (event: TDragEndEvent) => {
                                                // error handling in promise not implemented yet!

                                                // store new coords
                                                let newLatLngObj = event.target.getLatLng()
                                                // in object
                                                let coords = [newLatLngObj.lat, newLatLngObj.lng]
                                                // try to find building
                                                let response = await doubleGisRestApi.getAddress(coords as pointCoordsType)
                                                if (response.meta.code === RESPONSE__SUCCESS) {
                                                    // if success
                                                    // try to get full address / just address / just name
                                                    // then take control back to edit bar
                                                    let address: string
                                                    let id: string
                                                    address = response.result.items[0].full_address_name ? response.result.items[0].full_address_name : ''
                                                    id = response.result.items[0].id
                                                    setError('')
                                                    props.emitterMap.emit(EVENT__REFRESH_OBJECT_PROPERTIES, {
                                                        address,
                                                        id,
                                                        coords
                                                    })
                                                } else {
                                                    // if not success
                                                    // set error
                                                    // and return marker to start position
                                                    setError('Здание не найдено')
                                                    newMarker.setLatLng(obj.coords)
                                                }
                                            })
                                        } else if (!draggable && currentEditingObjectMarkerPosition.current) {
                                            // if we exit draw mode any way (not any now!!!)
                                            // make marker undraggable
                                            let coords = currentEditingObjectMarkerPosition.current.getLatLng()
                                            currentEditingObjectMarkerPosition.current.removeFrom(map)
                                            currentEditingObjectMarkerPosition.current = DG.marker(coords).addTo(map)
                                        }
                                    }
                                    let editingObj = obj as TEditingObjectType
                                    // create obj of editing type
                                    // and give function to it
                                    // then create obj and push it to edit bar
                                    editingObj.changeMarkerDraggableMode = changeMarkerDraggableMode
                                    createObject(editingObj);
                                }
                            })
                        } else if (obj.itIs === 'line') {
                            objectToMap = DG.polyline(obj.coords).addTo(map)
                        } else if (obj.itIs === 'polygon') {
                            objectToMap = DG.polygon(obj.coords).addTo(map)
                        }

                        newObjects.push(objectToMap)
                        if (obj.entranceCoords && obj.entranceCoords.length) {
                            // if object have entrance coords - draw it
                            let latLng = obj.entranceCoords
                            let marker = DG.marker(latLng, {icon: entrancePic, opacity: 0.6}).addTo(map);
                            newObjects.push(marker)
                        }
                        if (obj.squareBorders && obj.squareBorders.length) {
                            // if object have square coords - draw it
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
        }, [props.objs, map, setError, createObject, props.emitterMap, removeUnsavedObjectsFromMap])
        useEffect(() => {
            // if edit mode was changed
            // remove unsaved objects from map
            currentEditMode.current = props.editMode
            if (map) {
                removeUnsavedObjectsFromMap()
            }
        }, [map, props.editMode, removeUnsavedObjectsFromMap])
        useEffect(() => {
            props.emitterSideBar.on(EVENT__CHANGE_DRAW_MODE, (drawMode: drawingClassType) => {
                currentDrawClass.current = drawMode
                if (drawMode === 'square' && currentSquare.current) {
                    currentSquare.current.removeFrom(map)
                    currentSquare.current = null
                }
            })
            props.emitterSideBar.on(EVENT__CREATE_MARKER, (coords: pointCoordsType) => {
                createMarker({latlng: {lat: coords[0], lng: coords[1]}}, map)
            })
            props.emitterSideBar.on(EVENT__CHANGE_EDIT_MODE, removeUnsavedObjectsFromMap)

            return () => {
                props.emitterSideBar.removeAllListeners()
            }
        }, [createMarker, props.emitterSideBar, map, removeUnsavedObjectsFromMap])

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

                                         if (currentDrawClass.current === 'position') {
                                             createMarker(event, mapElem)
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