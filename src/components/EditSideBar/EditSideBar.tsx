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
    EVENT__CHANGE_DRAW_MODE, EVENT__CHANGE_EDIT_MODE, EVENT__CREATE_MARKER,
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
        // this function will be executed only on first render
        sendDrawModeToMap('nothing')
        return 'create'
    })

    // what does we drawing now in map component?
    const [drawMode, setDrawMode] = useState<drawingClassType>('nothing')

    // object in editing state here and in app component
    const [currentObject, setCurrentObject] = useState<TEditingObjectType>(props.object)

    // callbacks
    const changeDrawMode = useCallback((mode: drawingClassType, editMode: TEditMode, callback?: (nextMode: drawingClassType) => void) => {
        // switch on if first click on button
        // switch off if second click on button
        // then send value to map event emitter and change on it here
        let nextMode: drawingClassType = mode === drawMode ? 'nothing' : mode

        // additional function within changing draw mode
        callback && callback(nextMode)
        if (nextMode === "position" && editMode === 'update') {
            sendDrawModeToMap('nothing')
        } else {
            sendDrawModeToMap(nextMode)
        }
        setDrawMode(nextMode)
    }, [drawMode, sendDrawModeToMap])
    const changeEditMode = useCallback((value: TEditSideBarEditMode) => {
        // switching edit mode here and in map component
        // then rerender
        // each changing of edit mode must be executed with rerender
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
    const updateObject = useCallback((obj: Partial<objectType>) => {
        // merge changed properties of object
        setCurrentObject({...currentObject, ...obj})
    }, [currentObject])
    const setMarkerOnCoords = useCallback((coords: pointCoordsType) => {
        // get address from user then get its coords then set marker
        props.emitterSideBar.emit(EVENT__CREATE_MARKER, coords)
    }, [props.emitterSideBar])

    // use effects
    useEffect(() => {
        // add event listener on emitter
        // if event then update object here
        props.emitterMap.on(EVENT__REFRESH_OBJECT_PROPERTIES, (obj: Partial<objectType>) => {
            updateObject(obj)
        })
        return () => {
            // delete event listeners if component just has died
            props.emitterMap.removeAllListeners()
        }
    }, [updateObject, props.emitterMap])
    useEffect(() => {
        // if new object or new edit mode
        // although if new edit mode then and new object too
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
    useEffect(() => {
        // concept is
        // if edit mode (here or in app component) is changing
        // then delete all unsaved objects from map
        // so here when edit mode is changing we send message to emitter in map 'delete all unsaved objects'
        props.emitterSideBar.emit(EVENT__CHANGE_EDIT_MODE)
    }, [props.emitterSideBar, editMode])

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

