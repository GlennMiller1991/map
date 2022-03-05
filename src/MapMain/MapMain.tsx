import React, {useEffect, useRef, useState} from "react";
import {objectType} from "../types";

const DG = require('2gis-maps');

type MapMainProps = {
    objs: objectType[]
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {
        console.log('from mapMain')
        const [map, setMap] = useState(null)
        let currentMarkers = useRef<any[]>([])

        useEffect(() => {
            console.log('from useEffect')

            if (map) {
                debugger
                if (currentMarkers.current.length) {
                    currentMarkers.current.forEach((marker) => {
                        marker.removeFrom(map)
                    })
                }
                if (props.objs.length) {
                    let newMarkers: any[] = []
                    props.objs.forEach((obj, index) => {
                        const marker = DG.marker(obj).addTo(map)
                        marker.on('click', () => {
                            marker.bindPopup(obj.name).openPopup();
                        })
                        newMarkers[index] = marker
                    })
                    currentMarkers.current = newMarkers
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