import React, {useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import {objectType} from "./types";
import test_objects from './data/test_objects.json'

function App() {
    const [objectsSet, setObjectsSet] = useState(test_objects as objectType[])
    const onClickHandler = () => {
        // зачистка массива координат в каждом объекте по нажатию кнопки
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