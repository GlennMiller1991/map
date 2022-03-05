import React, {useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import sportObjects from './data/sport_objects.json'
import anotherSportObjects from './data/another_sport_objects.json'
import {objectType} from "./types";
import minObjectOne from './data/min_objects_one.json'
import minObjectTwo from './data/min_objects_two.json'

function App() {
    const [objectsSet, setObjectsSet] = useState(2)
    const onClickHandler = () => {
        setObjectsSet(objectsSet + 1)
    }
    return (
        <div className={styles.App}>
            <TestingPanel callback={onClickHandler}/>
            <div className={styles.mapContainer}>
                <MapMain objs={
                    objectsSet % 2 === 1 ?
                        minObjectOne as unknown as objectType[] :
                        minObjectTwo as unknown as objectType[]}/>
            </div>
        </div>
    );
}

export default App;

type TestingPanelType = {
    callback: () => void
}
export const TestingPanel: React.FC<TestingPanelType> = React.memo((props) => {
    return (
        <div>
            <button onClick={props.callback}>Another objects</button>
        </div>
    )
})