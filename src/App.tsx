import React, {useCallback, useMemo, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./components/MapMain/MapMain";
import {objectType} from "./misc/types";
import {EditSideBar} from "./components/EditSideBar/EditSideBar";
import EventEmitter from "events";
import {ErrorMessage} from "./components/ErrorMessage/ErrorMessage";

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

type TExtObjectType = objectType & {
    delObject?: () => void,
}

function App() {

    //state
    const [appError, setAppError] = useState<string>('')
    const [currentObject, setCurrentObject] = useState<TExtObjectType>(fakeObject)
    const [editMode, setEditMode] = useState(false)
    const [objectsSet, setObjectsSet] = useState<objectType[]>([])
    const [emitterSideBar, emitterMap] = useMemo(() => {
        return [new EventEmitter(), new EventEmitter()]
    }, [])

    //callbacks
    const rerenderFunction = useCallback(() => {
        setObjectsSet([...objectsSet])
        setCurrentObject(fakeObject)
        setAppError('')
    }, [objectsSet])
    const setError = useCallback((error: string) => {
        setAppError(error)
    }, [])
    const onClickHandler = useCallback(() => {
        if (editMode) {
            setObjectsSet([...objectsSet])
        } else {
            setCurrentObject(fakeObject)
        }
        setEditMode(!editMode)
    }, [objectsSet, editMode])
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
    const saveToLS = useCallback((objectsSet: objectType[]) => {
        // Function reflects current objects set in state on localstorage.
        // So can delete all local storage data if call it with empty objects array.
        // Objects is stored by 2gis id of object
        //
        // 1. clear local storage
        // 2. save all objects from state
        //
        // set error if browser does not allow to save to local storage
        try {
            localStorage.clear()
            objectsSet.forEach((object) => {
                localStorage.setItem(object.id, JSON.stringify(object))
            })
        } catch (err) {
            let error = err as DOMException
            if (error.code === 18) {
                setAppError('Политика безопасности браузера не позволяет использовать хранилище')
            } else {
                setAppError('Что-то пошло не так. Команда разработчиков уже в курсе дела')
            }

        }
    }, [])
    const loadFromLS = useCallback(() => {
        // load object from ls with deleting all current objects in state
        // set error if browser does not allow to save to local storage
        try {
            let objects: Array<objectType> = []
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i)
                if (key) {
                    let object = localStorage.getItem(key)
                    if (object) {
                        objects[i] = JSON.parse(object) as objectType
                    }
                }
            }
            setObjectsSet(objects)
        } catch(err) {
            let error = err as DOMException
            if (error.code === 18) {
                setAppError('Политика безопасности браузера не позволяет использовать хранилище')
            } else {
                setAppError('Что-то пошло не так. Команда разработчиков уже в курсе дела')
            }
        }
    }, [])

    return (
        <div className={styles.App}>
            <div className={styles.mapContainer}>
                <button className={styles.addControl} onClick={onClickHandler}>
                    <span className={styles.addSign}>Edit</span>
                </button>
                <button className={styles.addControl + ' ' + styles.saveControl}
                        onClick={() => saveToLS(objectsSet)}>
                    <span className={styles.addSign}>Save</span>
                </button>
                <button className={styles.addControl + ' ' + styles.loadControl}
                        onClick={loadFromLS}>
                    <span className={styles.addSign}>Load</span>
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
                                 rerenderFunction={rerenderFunction}
                                 deleteObject={deleteObject}
                                 isNew={!objectsSet.find(object => object.id === currentObject.id)}
                                 error={appError}
                                 setError={setError}/>
                }
                <MapMain emitterMap={emitterMap}
                         emitterSideBar={emitterSideBar}
                         objs={objectsSet}
                         editMode={editMode}
                         createObject={createObject}
                         setError={setError}
                         error={appError}/>
            </div>
            {
                appError &&
                <ErrorMessage message={appError}/>
            }
        </div>
    );
}

export default App;