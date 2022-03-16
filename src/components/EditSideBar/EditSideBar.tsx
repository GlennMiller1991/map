import {coordsType, drawingClassType, objectType, pointCoordsType, TEditingObjectType} from "../../misc/types";
import React, {useCallback, useEffect, useState} from "react";
import EventEmitter from "events";
import styles from './EditSideBar.module.scss'
import {EVENT__CHANGE_DRAW_MODE} from "../../misc/constants";
import {TabContent} from "./TabContent/TabContent";

export type TEditMode = 'create' | 'update'
type TEditSideBarPropsType = {
    emitterSideBar: EventEmitter,
    emitterMap: EventEmitter,
    object: TEditingObjectType,
    callback: (obj: objectType) => void,
    isNew: boolean,
    deleteObject: (id: string) => void,
    error: string,
    setError: (error: string) => void,
    rerenderFunction: () => void,
}
export const EditSideBar: React.FC<TEditSideBarPropsType> = React.memo((props) => {

    const sendDrawModeToMap = useCallback((value: drawingClassType) => {
        props.emitterSideBar.emit(EVENT__CHANGE_DRAW_MODE, value)
    }, [props.emitterSideBar])

    const [editMode, setEditMode] = useState<'create' | 'update'>(() => {
        sendDrawModeToMap('nothing')
        return 'create'
    })
    const [drawMode, setDrawMode] = useState<drawingClassType>('nothing')
    const [currentObject, setCurrentObject] = useState<TEditingObjectType>(props.object)
    const changeDrawMode = useCallback((mode: drawingClassType) => {
        let nextMode: drawingClassType = mode === drawMode ? 'nothing' : mode
        sendDrawModeToMap(nextMode)
        setDrawMode(nextMode)
    }, [drawMode, sendDrawModeToMap])
    const changeEditMode = useCallback((value: 'create' | 'update') => {
        if (value === 'create') {
            sendDrawModeToMap('position')
        } else {
            sendDrawModeToMap('nothing')
        }
        setDrawMode('position')
        setEditMode(value)
        props.rerenderFunction()
    }, [props.emitterSideBar, props.rerenderFunction])

    const setMarkerOnCoords = useCallback((coords: pointCoordsType) => {
        props.emitterSideBar.emit('createMarker', coords)
    }, [props.emitterSideBar])
    const updateObject = useCallback((obj: Partial<objectType>) => {
        setCurrentObject({...currentObject, ...obj})
    }, [currentObject])


    useEffect(() => {
        props.emitterMap.on('entranceWasCreated', (coords: coordsType) => {
            updateObject({entranceCoords: coords})
        })
        props.emitterMap.on('squareWasCreated', (coords: coordsType) => {
            updateObject({squareBorders: coords})
        })
        return () => {
            props.emitterMap.removeAllListeners()
        }
    }, [updateObject, props.emitterMap])
    useEffect(() => {
        setEditMode(props.isNew ? 'create' : 'update')
        setDrawMode('position')
        setCurrentObject(props.object)
        if (props.isNew) {
            sendDrawModeToMap('position')
        } else {
            sendDrawModeToMap('nothing')
        }
    }, [props.isNew, props.object, sendDrawModeToMap])

    return (
        <div className={styles.editSideBar}>
            <button onClick={() => {
                if (currentObject.makeMarkerDraggable) {
                    let coords = currentObject.makeMarkerDraggable()
                    // updateObject({coords: [coords.lat, coords.lng]})
                        console.log(coords)
                }
            }}>
                drag
            </button>
            <div className={styles.container}>
                <div className={styles.tabsContainer}>
                    <div className={`${styles.tab} ${editMode === 'create' ? styles.activeTab : ''}`}
                         onClick={() => changeEditMode('create')}>
                        Создать
                    </div>
                    <div className={`${styles.tab} ${editMode === 'update' ? styles.activeTab : ''}`}
                         onClick={() => changeEditMode('update')}>
                        Редактировать
                    </div>
                </div>
                <TabContent drawMode={drawMode}
                            deleteObject={props.deleteObject}
                            updateObject={updateObject}
                            createObject={props.callback}
                            setMarkerOnCoords={setMarkerOnCoords}
                            changeDrawMode={changeDrawMode}
                            currentObject={currentObject}
                            sendDrawModeToMap={sendDrawModeToMap}
                            editMode={editMode}
                            emitterSideBar={props.emitterSideBar}/>
            </div>
        </div>
    )
})

