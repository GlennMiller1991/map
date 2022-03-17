import {
    drawingClassType,
    objectType,
    pointCoordsType,
    TEditingObjectType,
    TEditSideBarEditMode
} from "../../misc/types";
import React, {useCallback, useEffect, useState} from "react";
import EventEmitter from "events";
import styles from './EditSideBar.module.scss'
import {
    EVENT__CHANGE_DRAW_MODE,
    EVENT__REFRESH_OBJECT_PROPERTIES
} from "../../misc/constants";
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
        // function for typification emitter.emit()
        props.emitterSideBar.emit(EVENT__CHANGE_DRAW_MODE, value)
    }, [props.emitterSideBar])

    // state
    // new object or old
    const [editMode, setEditMode] = useState<TEditSideBarEditMode>(() => {
        sendDrawModeToMap('nothing')
        return 'create'
    })

    // what does we drawing now in map component?
    const [drawMode, setDrawMode] = useState<drawingClassType>('nothing')

    // object in editing state here and in app component
    const [currentObject, setCurrentObject] = useState<TEditingObjectType>(props.object)

    // callbacks
    const changeDrawMode = useCallback((mode: drawingClassType, callback?: (nextMode: drawingClassType) => void) => {
        // switch on if first click on button
        // switch off if second click on button
        // then send value to map event emitter and change on it here
        //
        // sendToMap and setDrawMode almost always is the same
        // except update edit mode when position changing by another way
        let nextMode: drawingClassType = mode === drawMode ? 'nothing' : mode
        callback && callback(nextMode)
        sendDrawModeToMap(nextMode)
        setDrawMode(nextMode)
    }, [drawMode, sendDrawModeToMap])
    const changeEditMode = useCallback((value: TEditSideBarEditMode) => {
        // switching edit mode with side effects

        if (value === 'create') {
            sendDrawModeToMap('position')
            setDrawMode('position')
        } else {
            sendDrawModeToMap('nothing')
            setDrawMode('nothing')
        }
        setEditMode(value)
        props.rerenderFunction()
    }, [props.emitterSideBar, props.rerenderFunction, sendDrawModeToMap])

    const setMarkerOnCoords = useCallback((coords: pointCoordsType) => {
        props.emitterSideBar.emit('createMarker', coords)
    }, [props.emitterSideBar])
    const updateObject = useCallback((obj: Partial<objectType>) => {
        setCurrentObject({...currentObject, ...obj})
    }, [currentObject])


    useEffect(() => {
        props.emitterMap.on(EVENT__REFRESH_OBJECT_PROPERTIES, (obj: Partial<objectType>) => {
            updateObject(obj)
            console.log(obj)
        })
        return () => {
            props.emitterMap.removeAllListeners()
        }
    }, [updateObject, props.emitterMap])
    useEffect(() => {
        let newEditMode: TEditSideBarEditMode = props.isNew ? 'create' : 'update'
        setEditMode(newEditMode)

        if (newEditMode === 'create') {
            sendDrawModeToMap('position')
            setDrawMode('position')
        } else {
            sendDrawModeToMap('nothing')
            setDrawMode('nothing')
        }
        setCurrentObject(props.object)
    }, [props.isNew, props.object, sendDrawModeToMap])

    return (
        <div className={styles.editSideBar}>
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

