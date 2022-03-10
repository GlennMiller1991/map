import React, {useCallback, useEffect, useRef, useState} from "react";
import {coordsType, objectType} from "../types";
import {generateCoords} from "../utils/generateCoords";
import {getBounds} from "../utils/getBounds";
import {EventEmitter} from "events";
import {v1} from "uuid";

const DG = require('2gis-maps');

type MapMainProps = {
    objs: objectType[],
    editMode: boolean,
    emitter: EventEmitter,
    createObject: (obj: objectType) => void,
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {
        //state
        const [map, setMap] = useState(null)


        // доступ к актуальным данным расположенных на карте объектов не через useState
        let currentObjectsOnMap = useRef<any[]>([])
        let currentEditMode = useRef<boolean>(props.editMode)
        let currentEditingObject = useRef<any>(null)


        const createObj = (event: any, map: any) => {
            if (currentEditingObject.current) {
                currentEditingObject.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]
            const marker = DG.marker([...latLng], {
                draggable: true,
            }).addTo(map);
            currentEditingObject.current = marker
            props.createObject({
                coords: latLng,
                itIs: "point",
                name: '',
                id: v1(),
                address: {
                    building: 0,
                    city: '',
                    office: 0,
                    street: '',
                },
                classOfObject: null,
                square: 0,
                squareBorders: [],
                telephone: ''
            })
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
                            objectToMap.bindPopup(obj.name).openPopup();
                        })
                        newObjects[index] = objectToMap
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
                                         createObj(event, mapElem)
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