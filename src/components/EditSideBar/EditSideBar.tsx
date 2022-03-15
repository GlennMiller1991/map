import {drawingClassType, objectType, pointCoordsType} from "../../misc/types";
import React, {useCallback, useEffect, useState} from "react";
import EventEmitter from "events";
import styles from './EditSideBar.module.scss'
import {CHANGE_DRAW_MODE} from "../../misc/constants";
import {TabContent} from "./TabContent/TabContent";
import { CustomInput } from "./CustomInput/CustomInput";
import {CustomSelect} from "./CustomSelect/CustomSelect";
//import styles from "../../App.module.scss";
export type TEditMode = 'create' | 'update'
type TEditSideBarPropsType = {
    emitterSideBar: EventEmitter,
    emitterMap: EventEmitter,
    object: objectType,
    callback: (obj: objectType) => void,
    isNew: boolean,
    deleteObject: (id: string) => void,
    error: string,
    setError: (error: string) => void,
    rerenderFunction: () => void,
}
export const EditSideBar: React.FC<TEditSideBarPropsType> = React.memo((props) => {
    console.log('from editBar')
    const sendDrawModeToMap = useCallback((value: drawingClassType) => {
        props.emitterSideBar.emit(CHANGE_DRAW_MODE, value)
    }, [props.emitterSideBar])

    const [editMode, setEditMode] = useState<'create' | 'update'>(() => {
        sendDrawModeToMap('nothing')
        return 'create'
    })
    const [drawMode, setDrawMode] = useState<drawingClassType>('nothing')
    const [currentObject, setCurrentObject] = useState<objectType>(props.object)
    const changeDrawMode = useCallback((mode: drawingClassType) => {
        let nextMode: drawingClassType = mode === drawMode ? 'nothing' : mode
        sendDrawModeToMap(nextMode)
        setDrawMode(nextMode)
    }, [drawMode, sendDrawModeToMap])
    const changeEditMode = useCallback((value: 'create' | 'update') => {
        sendDrawModeToMap('nothing')
        setEditMode(value)
        setDrawMode('nothing')
        props.rerenderFunction()
    }, [props.emitterSideBar, props.rerenderFunction])

    const setMarkerOnCoords = useCallback((coords: pointCoordsType) => {
        props.emitterSideBar.emit('createMarker', coords)
    }, [props.emitterSideBar])
    const updateObject = useCallback((obj: Partial<objectType>) => {
        setCurrentObject({...currentObject, ...obj})
    }, [currentObject])

    // state
    // const [currentObject, setCurrentObject] = useState<objectType>(props.object)
    // const [isNew, setIsNew] = useState(props.isNew)
    //

    //
    // //validators
    // const emailVal = (value: string) => {
    //     return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
    // }
    //
    // //useEffects
    // useEffect(() => {
    //     setIsNew(props.isNew)
    // }, [props.isNew])
    // useEffect(() => {
    //     props.emitterMap.on('entranceWasCreated', (coords: coordsType) => {
    //         updateObject({entranceCoords: coords})
    //     })
    //     props.emitterMap.on('squareWasCreated', (coords: coordsType) => {
    //         updateObject({squareBorders: coords})
    //     })
    //     return () => {
    //         props.emitterMap.removeAllListeners()
    //     }
    // }, [updateObject, props.emitterMap])
    // useEffect(() => {
    //     setDrawMode('defaultTypes')
    //     props.emitterSideBar.emit('changeDrawMode', 'defaultTypes')
    //     setCurrentObject(props.object)
    // }, [props.object, props.emitterSideBar])
    // useEffect(() => {
    //     setCurrentObject(props.object)
    // }, [props.object])
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
        //             <button className={styles.control}
        //                     onClick={() => props.deleteObject(currentObject.id)}>
        //                 DEL
        //             </button>
        //         </div>
        //     </div>
        // </div>
    )
})

type TObjectFormProps = {
    currentObject: objectType,
    updateObject: (object: Partial<objectType>) => void,
}
export const ObjectForm: React.FC<TObjectFormProps> = React.memo((props) => {
    return (
        <React.Fragment>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Название'}
                         value={props.currentObject.name}
                         keyName={'name'} callback={props.updateObject}/>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Телефон'} value={props.currentObject.telephone} keyName={'telephone'}
                         callback={props.updateObject}/>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Email'}
                         value={props.currentObject.email}
                         keyName={'email'}
                         callback={props.updateObject}/>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Площадь'} value={props.currentObject.square}
                         keyName={'square'}
                         callback={props.updateObject}/>
            <CustomSelect text={'Тип помещения'}
                          disabled={!props.currentObject.coords.length}// || !!props.error}
                          value={props.currentObject.classOfObject} keyName={'classOfObject'}
                          callback={props.updateObject}/>
        </React.Fragment>
    )
})