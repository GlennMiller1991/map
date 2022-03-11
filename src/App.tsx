import React, {useCallback, useMemo, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import {objectType} from "./types";
import {EditSideBar} from "./EditSideBar/EditSideBar";
import EventEmitter from "events";

export const fakeObject: objectType = {
    classOfObject: undefined,
    square: '',
    coords: [],
    entranceCoords: null,
    telephone: '',
    email: '',
    id: '-1',
    name: '',
    address: '',
    itIs: "point",
    squareBorders: [],
}

function App() {

    //state
    const [currentObject, setCurrentObject] = useState<objectType>(fakeObject)
    const [editMode, setEditMode] = useState(false)
    const [objectsSet, setObjectsSet] = useState<objectType[]>([])
    const [emitterSideBar, emitterMap] = useMemo(() => {
        return [new EventEmitter(), new EventEmitter()]
    }, [])

    //callbacks
    const onClickHandler = () => {
        if (editMode) {
            setObjectsSet([...objectsSet])
        } else {
            setCurrentObject(fakeObject)
        }
        setEditMode(!editMode)
    }
    const createObject = (obj: objectType) => {
        setCurrentObject(obj)
    }
    const addObject = useCallback((obj: objectType) => {
        onClickHandler()
        setObjectsSet([...objectsSet, obj])
    }, [objectsSet, onClickHandler])
    const updateObject = (obj: objectType) => {
        onClickHandler()
        setObjectsSet(objectsSet.map((object) => object.id === obj.id ? obj : object))
    }
    const deleteObject = (id: string) => {
        debugger
        const newObjectsSet = objectsSet.filter(object => object.id !== id)
        setObjectsSet(newObjectsSet)
        setEditMode(!editMode)
    }

    return (
        <div className={styles.App}>
            <div className={styles.mapContainer}>
                <button className={styles.addControl} onClick={onClickHandler}>
                    <span className={styles.addSign}>Edit</span>
                </button>
                {
                    editMode &&
                    <EditSideBar emitterSideBar={emitterSideBar}
                                 emitterMap={emitterMap}
                                 object={currentObject}
                                 callback={
                                     objectsSet.find(object => object.id === currentObject.id) ?
                                         updateObject :
                                         addObject
                                 }
                                 deleteObject={deleteObject}
                                 isNew={!objectsSet.find(object => object.id === currentObject.id)}/>
                }
                <MapMain emitterMap={emitterMap}
                         emitterSideBar={emitterSideBar}
                         objs={objectsSet}
                         editMode={editMode}
                         createObject={createObject}/>
            </div>
        </div>
    );
}

export default App;

