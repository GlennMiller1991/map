import React, {useEffect, useRef, useState} from "react";
import {drawingClassType, objectType} from "../types";
import {getBounds} from "../utils/getBounds";
import {v1} from "uuid";
import EventEmitter from "events";
import arrow from './../imgs/arrow.png';

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
    drawingClass: drawingClassType,
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {

        //state
        const [map, setMap] = useState(null)

        // доступ к актуальным данным расположенных на карте объектов не через useState
        let currentObjectsOnMap = useRef<any[]>([])
        let currentEditMode = useRef<boolean>(props.editMode)
        let currentEditingObjectOnMap = useRef<any>(null)
        let currentDrawClass = useRef<drawingClassType>(props.drawingClass)
        let currentEntrance = useRef<any>(null)

        const createObj = (event: any, map: any) => {
            if (currentEditingObjectOnMap.current) {
                currentEditingObjectOnMap.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]
            const marker = DG.marker([...latLng], {
                draggable: false,
            }).addTo(map);
            currentEditingObjectOnMap.current = marker
            currentObjectsOnMap.current.push(marker)
            props.createObject({
                coords: latLng,
                itIs: "point",
                name: '',
                id: v1(),
                address: '',
                entranceCoords: null,
                classOfObject: null,
                square: '0',
                squareBorders: [],
                telephone: ''
            })
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
                    debugger
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
            currentDrawClass.current = props.drawingClass
        }, [props.drawingClass])
        useEffect(() => {
            props.emitterSideBar.on('changeDrawMode', (drawMode: drawingClassType) => {
                currentDrawClass.current = drawMode
                console.log(currentDrawClass.current)
            })
            return () => {
                props.emitterSideBar.removeAllListeners()
            }
        }, [props.emitterSideBar])

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
                                     'zoom': 9
                                 })
                                 mapElem.on('click', (event: any) => {
                                     if (currentEditMode.current) {
                                         if (currentDrawClass.current === 'defaultTypes') {
                                             createObj(event, mapElem)
                                         } else {
                                             createEntrance(event, mapElem)
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