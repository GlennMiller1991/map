import React, {useCallback, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import {objectType} from "./types";
import {EditSideBar} from "./EditSideBar/EditSideBar";

export const fakeObject: objectType = {
    classOfObject: null,
    square: '0',
    coords: [],
    telephone: '',
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

    return (
        <div className={styles.App}>
            <div className={styles.mapContainer}>
                <button className={styles.addControl} onClick={onClickHandler}>
                    <span className={styles.addSign}>Add</span>
                </button>
                {
                    editMode &&
                    <EditSideBar object={currentObject}
                                  callback={
                                      objectsSet.find(object => object.id === currentObject.id) ?
                                          updateObject :
                                          addObject
                                  }/>
                }
                <MapMain objs={objectsSet}
                         editMode={editMode}
                         createObject={createObject}/>
            </div>
        </div>
    );
}

export default App;

