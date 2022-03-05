import React from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import sportObjects from './data/sport_objects.json'
import {objectType} from "./types";

function App() {
    return (
        <div className={styles.App}>
            <div className={styles.mapContainer}>
                <MapMain objs={sportObjects as objectType[]}/>
            </div>
        </div>
    );
}

export default App;

export const TestingPanel: React.FC = React.memo(() => {
    return (
        <div>
            <button>Objects</button>
            <button>Another objects</button>
        </div>
    )
})