import React, {useCallback, useEffect, useMemo, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./components/MapMain/MapMain";
import {objectType, TEditingObjectType} from "./misc/types";
import {EditSideBar} from "./components/EditSideBar/EditSideBar";
import EventEmitter from "events";
import {ErrorMessage} from "./components/ErrorMessage/ErrorMessage";
import {EXCEPTION__EXCEED_MEMORY, EXCEPTION__FORBIDDEN} from "./misc/constants";

export const fakeObject: objectType = {
    // empty coords array and id is
    // using for dis/able functionality
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
    // error log for user
    const [appError, setAppError] = useState<string>('')

    // object that now is in edit bar component for creating or editin
    const [currentObject, setCurrentObject] = useState<TEditingObjectType>(fakeObject)

    // show edit bar?
    const [editMode, setEditMode] = useState(false)

    // objects on the map without just created
    const [objectsSet, setObjectsSet] = useState<objectType[]>([])

    // event emitters - messages exchange between map and sidebar
    const [emitterSideBar, emitterMap] = useMemo(() => {
        return [new EventEmitter(), new EventEmitter()]
    }, [])


    //callbacks
    const rerenderFunction = useCallback(() => {
        // return to default state of app
        // clearing error, wiping object out of edit bar
        // rerender saved objects in state
        setObjectsSet([...objectsSet])
        setCurrentObject(fakeObject)
        setAppError('')
    }, [objectsSet])
    const setError = useCallback((error: string) => {
        // function for easier throwing setState function in component
        // NO NEED!! REFACTOR
        setAppError(error)
    }, [])
    const onClickHandler = useCallback(() => {
        // switching edit mode
        // if next mode is edit - wiping object in sidebar
        // else - rerender
        if (editMode) {
            setObjectsSet([...objectsSet])
        } else {
            setCurrentObject(fakeObject)
        }
        setEditMode(!editMode)
    }, [objectsSet, editMode])
    const createObject = useCallback((obj: TEditingObjectType) => {
        // create object inside map component
        // function for easier throwing setState function in component
        // NO NEED!!! REFACTOR
        setCurrentObject(obj)
    }, [])
    const addObject = useCallback((obj: objectType) => {
        // switching edit mode with sweeping garbage
        // then add current object to objectsSet
        onClickHandler()
        setObjectsSet([...objectsSet, obj])
    }, [objectsSet, onClickHandler])
    const updateObject = useCallback((obj: TEditingObjectType) => {
        // switching edit mode with sweeping garbage
        // then update given object in state objectsSet if there is
        let {changeMarkerDraggableMode, ...newObj} = obj
        let newObjectSet = objectsSet.map((object) => {
            return object.id === currentObject.id ? newObj as objectType : object
        })
        setObjectsSet(newObjectSet)
        setEditMode(!editMode)
    }, [onClickHandler, objectsSet, currentObject])
    const deleteObject = useCallback((id: string) => {
        // filter objectsSet by id
        // then update objectsSet
        // then close editBar
        const newObjectsSet = objectsSet.filter(object => object.id !== id)
        setObjectsSet(newObjectsSet)
        setEditMode(false)
    }, [objectsSet])
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
            setAppError('Данные сохранены')
        } catch (err) {
            let error = err as DOMException
            switch(error.code) {
                case EXCEPTION__FORBIDDEN:
                    setAppError('Ошибка доступа')
                    break
                case EXCEPTION__EXCEED_MEMORY:
                    setAppError('Ошибка памяти')
                    break
                default:
                    setAppError('Ошибка записи')
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
            setAppError('Данные загружены')
            setObjectsSet(objects)
        } catch(err) {
            let error = err as DOMException
            switch(error.code) {
                case EXCEPTION__FORBIDDEN:
                    setAppError('Ошибка доступа')
                    break
                case EXCEPTION__EXCEED_MEMORY:
                    setAppError('Ошибка памяти')
                    break
                default:
                    setAppError('Ошибка чтения данных')
            }
        }
    }, [])

    // side effects
    useEffect(() => {
        // listen for storage event from another browser tab
        const storageListener = () => {
            setAppError('Данные изменились в другой вкладке')
        }
        window.addEventListener('storage', storageListener)
        return () => {
            // delete event listener after app component will die
            window.removeEventListener('storage', storageListener)
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
                <ErrorMessage message={appError} removeMessage={setError}/>
            }
        </div>
    );
}

export default App;