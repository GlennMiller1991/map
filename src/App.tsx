import React, {useCallback, useMemo, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import {objectType} from "./types";
import {EventEmitter} from "events";
import {EditSideBar} from "./EditSideBar/EditSideBar";

export const fakeObject: objectType = {
    classOfObject: null,
    square: 0,
    coords: [],
    telephone: '',
    id: '-1',
    name: '',
    address: {
        building: 0,
        city: '',
        office: 0,
        street: '',
    },
    itIs: "point",
    squareBorders: [],
}

function App() {

    const [currentObject, setCurrentObject] = useState<objectType>(fakeObject)
    const [editMode, setEditMode] = useState(true)
    const [objectsSet, setObjectsSet] = useState<objectType[]>([])
    const emitter = useMemo(() => {
        return new EventEmitter()
    }, [])

    //callbacks
    const onClickHandler = () => {
        setEditMode(!editMode)
    }
    const createObject = (obj: objectType) => {
        setCurrentObject(obj)
    }
    const addObject = useCallback((obj: objectType) => {
        setObjectsSet([...objectsSet, obj])
    }, [objectsSet])

    return (
        <div className={styles.App}>
            <div className={styles.mapContainer}>
                <button className={styles.addControl} onClick={onClickHandler}>
                    <span className={styles.addSign}>Add</span>
                </button>
                {
                    editMode && <EditSideBar emitter={emitter} object={currentObject} addObject={addObject}/>
                }
                <MapMain objs={objectsSet}
                         editMode={editMode}
                         createObject={createObject}
                         emitter={emitter}/>
            </div>
        </div>
    );
}

export default App;

