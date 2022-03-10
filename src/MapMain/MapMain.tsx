import React, {useEffect, useRef, useState} from "react";
import {drawingClassType, objectType} from "../types";
import {getBounds} from "../utils/getBounds";
import {v1} from "uuid";

const DG = require('2gis-maps');

type MapMainProps = {
    objs: objectType[],
    editMode: boolean,
    createObject: (obj: objectType) => void,
    drawingClass: drawingClassType,
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {
        //state
        const [map, setMap] = useState(null)
        console.log(props.drawingClass)
        // доступ к актуальным данным расположенных на карте объектов не через useState
        let currentObjectsOnMap = useRef<any[]>([])
        let currentEditMode = useRef<boolean>(props.editMode)
        let currentEditingObjectOnMap = useRef<any>(null)
        let currentDrawClass = useRef<drawingClassType>(props.drawingClass)
        let currentEditingObject = useRef<objectType | null>(null)

        const createObj = (event: any, map: any) => {
            if (currentEditingObjectOnMap.current) {
                currentEditingObjectOnMap.current.removeFrom(map)
            }
            let latLng = [event.latlng.lat, event.latlng.lng]
            const marker = DG.marker([...latLng], {
                draggable: true,
            }).addTo(map);
            currentEditingObjectOnMap.current = marker
            currentObjectsOnMap.current.push(marker)
            props.createObject({
                coords: latLng,
                itIs: "point",
                name: '',
                id: v1(),
                address: '',
                //     {
                //     building: 0,
                //     city: '',
                //     office: 0,
                //     street: '',
                // },
                classOfObject: null,
                square: '0',
                squareBorders: [],
                telephone: ''
            })
        }
        const createEntrance = (event: any, map: any) => {

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