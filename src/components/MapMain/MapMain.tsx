import React, {useEffect, useRef, useState} from "react";
import {drawingClassType, objectType, pointCoordsType} from "../../types";
import {getBounds} from "../../utils/getBounds";
import {v1} from "uuid";
import EventEmitter from "events";
import arrow from '../../imgs/arrow.png';
import {fakeObject} from "../../App";
import {doubleGisRestApi, TSearchResponse} from "../../rest_api/restApi";

const DG = require('2gis-maps');
const entrancePic = DG.icon({
    iconUrl: arrow,
    iconSize: [30, 30]
});

type MapMainProps = {
    emitterMap: EventEmitter,
    emitterSideBar: EventEmitter,
    objs: objectType[],
    editMode: boolean,
    createObject: (obj: objectType) => void,
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {

        //state
        const [map, setMap] = useState(null)


        // доступ к актуальным данным расположенных на карте объектов не через useState
        let currentObjectsOnMap = useRef<any[]>([])
        let currentEditMode = useRef<boolean>(props.editMode)
        let currentEditingObjectOnMap = useRef<any>(null)
        let currentDrawClass = useRef<drawingClassType>("defaultTypes")
        let currentEntrance = useRef<any>(null)
        let currentSquare = useRef<any>(null)

        const createObj = (event: any, map: any) => {
            if (currentEditingObjectOnMap.current) {
                currentEditingObjectOnMap.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]

            doubleGisRestApi.getAddress(latLng as pointCoordsType)
                .then((response: TSearchResponse) => {
                    let address = ''
                    let name = ''
                    if (response.meta.code === 200) {
                        address = response.result.items[0].full_address_name ? response.result.items[0].full_address_name : ''
                        name = response.result.items[0].name ? response.result.items[0].name : ''
                    }
                    props.createObject({
                        ...fakeObject,
                        address,
                        name,
                        coords: latLng,
                        id: v1()
                    })
                })

            const marker = DG.marker([...latLng]).addTo(map);
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
            props.emitterMap.emit('entranceWasCreated', latLng)
        }
        const createSquare = (event: any, map: any) => {
            if (currentSquare.current) {
                let latLng = [event.latlng.lat, event.latlng.lng]
                currentSquare.current.addLatLng(latLng)
                props.emitterMap.emit(
                    'squareWasCreated',
                    currentSquare.current.getLatLngs()[0].map((coords: any) => [coords.lat, coords.lng])
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
                    props.objs.forEach((obj, index) => {
                        // то прикрепляем к карте
                        let objectToMap: any

                        // точка, линия или многоугольник?
                        // под каждое значение 2gis предоставляет свой инструмент
                        // создания рендерящихся объектов
                        if (obj.itIs === 'point') {
                            objectToMap = DG.marker(obj.coords).addTo(map)
                        } else if (obj.itIs === 'line') {
                            objectToMap = DG.polyline(obj.coords).addTo(map)
                        } else if (obj.itIs === 'polygon') {
                            objectToMap = DG.polygon(obj.coords).addTo(map)
                        }
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
                            if (currentEditMode) {
                                props.createObject(obj);
                            }
                        })
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
        }, [props.editMode])
        useEffect(() => {
            props.emitterSideBar.on('changeDrawMode', (drawMode: drawingClassType) => {
                currentDrawClass.current = drawMode
                if (drawMode === 'square' && currentSquare.current) {
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
                                     if (currentEditMode.current) {
                                         if (currentDrawClass.current === 'defaultTypes') {
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