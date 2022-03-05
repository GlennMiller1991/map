import React, {useEffect, useState} from "react";
import {objectType} from "../types";

const DG = require('2gis-maps');
const clusterParams = {
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    maxClusterRadius: 50,
    disableClusteringAtZoom: 18
}

type MapMainProps = {
    objs?: objectType[]
}
export const MapMain: React.FC<MapMainProps> = React.memo((props) => {
        console.log('from mapMain')
        const [map, setMap] = useState(null)

        useEffect(() => {
            console.log('from useEffect')
            let cluster = DG.markerClusterGroup(clusterParams);
            if (map) {
                //@ts-ignore
                map.eachLayer((layer) => {
                    layer.remove()
                })
                props.objs?.forEach((obj, index) => {
                    const marker = DG.marker(obj)
                    cluster.addLayer(marker)
                })
                //@ts-ignore
                map.addLayer(cluster)
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
                                 console.log(mapElem)
                                 setMap(mapElem)
                                 debugger
                             }
                         }
                     }}/>
            </>
        )
    }
)