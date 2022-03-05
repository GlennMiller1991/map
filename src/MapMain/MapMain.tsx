import React, {useEffect, useRef, useState} from "react";
import {objectType} from "../types";

const DG = require('2gis-maps');

type MapMainProps = {
    objs: objectType[]
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {
        console.log('from mapMain')
        const [map, setMap] = useState(null)
        let currentObjectsOnMap = useRef<any[]>([])

        useEffect(() => {
            console.log('from useEffect')

            if (map) {
                if (currentObjectsOnMap.current.length) {
                    currentObjectsOnMap.current.forEach((marker) => {
                        marker.removeFrom(map)
                    })
                }
                if (props.objs.length) {
                    let newObjects: any[] = []
                    props.objs.forEach((obj, index) => {
                        debugger
                        let objectToMap:any
                        if (obj.itIs === 'point') {
                            objectToMap = DG.marker([obj.coords[0].lat, obj.coords[0].lng]).addTo(map)
                        } else if (obj.itIs === 'line') {
                            debugger
                            let coords = obj.coords.map(point => [point.lat, point.lng])
                            objectToMap = DG.polyline(coords).addTo(map)
                        } else if (obj.itIs === 'polygon') {
                            let coords = obj.coords.map(point => [point.lat, point.lng])
                            objectToMap = DG.polygon(coords).addTo(map)
                        }
                        objectToMap.on('click', () => {
                            objectToMap.bindPopup(obj.name).openPopup();
                        })
                        newObjects[index] = objectToMap
                    })
                    currentObjectsOnMap.current = newObjects
                }
            }
        }, [props.objs, map])

        return (
            <>
                <div id="map"
                     style={{width: '100%', height: '100%'}}
                     ref={(node) => {
                         if (node) {
                             if (!map) {
                                 let mapElem = DG.map('map', {
                                     'center': [55.754753, 37.620861],
                                     'zoom': 11
                                 })
                                 setMap(mapElem)
                             }
                         }
                     }}/>
            </>
        )
    }
)