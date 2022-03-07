import React, {useEffect, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import sportObjects from './data/sport_objects.json'
import anotherSportObjects from './data/another_sport_objects.json'
import {objectType} from "./types";
import minObjectOne from './data/min_objects_one.json'
import minObjectTwo from './data/min_objects_two.json'

function App() {
    const [objectsSet, setObjectsSet] = useState(minObjectTwo as objectType[])
    const onClickHandler = () => {
        setObjectsSet(objectsSet.map((object) => {
            object.coords = []
            return object
        }))
    }
    return (
        <div className={styles.App}>
            <div>
                <button onClick={onClickHandler}>Another objects</button>
            </div>
            <div className={styles.mapContainer}>
                <MapMain objs={objectsSet}/>
            </div>
        </div>
    );
}

export default App;