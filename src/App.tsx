import React, {useEffect, useMemo, useState} from 'react';
import styles from './App.module.scss';
import {MapMain} from "./MapMain/MapMain";
import {coordsType, objectType} from "./types";
import test_objects from './data/test_objects.json'
import {EventEmitter} from "events";


function App() {
    const [currentObject, setCurrentObject] = useState<null | objectType>(null)
    const [editMode, setEditMode] = useState(true)
    const [objectsSet, setObjectsSet] = useState([])
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

    return (
        <div className={styles.App}>
            <div className={styles.mapContainer}>
                <button className={styles.addControl} onClick={onClickHandler}>
                    <span className={styles.addSign}>Add</span>
                </button>
                {
                    editMode && <EditSideBar emitter={emitter} object={null}/>
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

type EditSideBarPropsType = {
    emitter: EventEmitter,
    object: null | objectType,
}

export const EditSideBar: React.FC<EditSideBarPropsType> = React.memo((props) => {
    console.log('from EditSideBar')
    const [currentObject, setCurrentObject] = useState<null | Partial<objectType>>(null)

    useEffect(() => {
        // вешаем слушателя на сайдбар, следящего за
        // созданием новых объектов через клик
        // После закрытия сайдбара, слушатели удаляются
        props.emitter.on('objectWasCreated', (coords: coordsType) => {
            console.log(coords)
            setCurrentObject({
                coords: coords,
                itIs: "point",
            })
        })
        return () => {
            props.emitter.removeAllListeners()
        }
    }, [props.emitter])

    return (
        <div className={styles.editSideBar}>
            <div>
                Click on the map first
            </div>
            <div>
                Coords
                <br/>

                {
                    //@ts-ignore
                    currentObject && currentObject.coords[0]
                }
                <br/>
                {
                    //@ts-ignore
                    currentObject && currentObject.coords[1]
                }
            </div>
            <div>
                Address
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <div>
                Entrance
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <div>
                Telephone
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <div>
                Add square
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
        </div>
    )
})
