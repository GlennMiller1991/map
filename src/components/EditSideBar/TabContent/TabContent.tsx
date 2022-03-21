import React, {useState} from "react";
import styles from "../EditSideBar.module.scss";
import commonStyles from '../../../common/styles/commonStyles.module.scss';

import {AddressInput} from "./AddressInput/AddressInput";
import {
    drawingClassType,
    objectType,
    pointCoordsType,
    TEditingObjectType,
    TEntranceEditMode
} from "../../../misc/types";
import EventEmitter from "events";
import {TEditMode} from "../EditSideBar";
import {ObjectForm} from "./ObjectForm/ObjectForm";
import {EntranceManagement} from "./EntranceManagement/EntranceManagement";

export type TTabContentProps = {
    setMarkerOnCoords: (coords: pointCoordsType) => void,
    editMode: TEditMode,
    emitterSideBar: EventEmitter,
    currentObject: TEditingObjectType,
    sendDrawModeToMap: (value: drawingClassType) => void,
    drawMode: drawingClassType,
    changeDrawMode: (
        value: drawingClassType,
        editMode: TEditMode,
        callback?: (nextMode: drawingClassType) => void
    ) => void,
    createObject: (obj: TEditingObjectType) => void,
    updateObject: (obj: Partial<objectType>) => void,
    deleteObject: (id: string) => void,
}
export const TabContent: React.FC<TTabContentProps> = React.memo((props) => {

    //state
    const [entranceEditMode, setEntranceEditMode] = useState<TEntranceEditMode>('nothing')

    const onChangeDrawModeExtension = (drawMode: drawingClassType) => {
        // additional function that invokes in changingDrawMode function
        // this function is calling always in change draw mode
        // but not always there is changeMarkerDraggableMode.
        // changeMarkerDraggableMode is creating only in update mode of side bar
        // and is giving only with updatable object
        props.currentObject.changeMarkerDraggableMode &&
        props.currentObject.changeMarkerDraggableMode(drawMode === 'position')
    }

    const onButtonClickCallback = (drawMode: drawingClassType) => {
        // function for making invoke simpler
        setEntranceEditMode('nothing')
        props.changeDrawMode(drawMode, props.editMode, onChangeDrawModeExtension)
    }

    const onEntranceButtonClickCallback = (value: TEntranceEditMode) => {
        let resultValue: TEntranceEditMode
        value === entranceEditMode ?
            resultValue = "nothing" :
            resultValue = value
        setEntranceEditMode(resultValue)
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.controlContainer}>
                <button className={`
                ${styles.control} 
                ${props.drawMode === 'position' ?
                    commonStyles.active : ''}
                    `}
                        disabled={props.editMode === 'update' && props.currentObject.id === '-1'}
                        onClick={() => onButtonClickCallback('position')}>
                    POS
                </button>
                <button className={`${styles.control} ${props.drawMode === 'naming' ?
                    commonStyles.active :
                    ''}`}
                        onClick={() => onButtonClickCallback('naming')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    NAM
                </button>
                <button className={`${styles.control} ${props.drawMode === 'entrance' ?
                    commonStyles.active :
                    ''}`}
                        onClick={() => onButtonClickCallback('entrance')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    ENT
                </button>
                <button className={`${styles.control} ${props.drawMode === 'square' ?
                    commonStyles.active :
                    ''}`}
                        onClick={() => onButtonClickCallback('square')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    SQU
                </button>
                <button className={styles.control}
                        onClick={() => props.deleteObject(props.currentObject.id)}>
                    DEL
                </button>
            </div>
            {
                props.drawMode === 'entrance' ?
                    <EntranceManagement editMode={entranceEditMode}
                                        updateObject={props.updateObject}
                                        entranceCoords={props.currentObject.entranceCoords}
                                        activeEntrance={props.currentObject.activeEntrance ? props.currentObject.activeEntrance : undefined}
                                        onButtonClickCallback={onEntranceButtonClickCallback}
                                        emitterSideBar={props.emitterSideBar}/> :
                    <div className={styles.inputsContainer}>
                        {
                            props.drawMode === 'position' &&
                            <AddressInput setMarker={props.setMarkerOnCoords}
                                          value={props.currentObject.address}
                                          disabled={props.editMode === 'update' || props.drawMode !== 'position'}/>
                        }
                        {
                            props.drawMode === 'naming' &&
                            <ObjectForm currentObject={props.currentObject} updateObject={props.updateObject}/>
                        }
                    </div>
            }
            <div className={styles.updateBtnContainer}>
                <button className={styles.updateBtn}
                        disabled={props.currentObject.id === '-1' /*|| !!props.error*/}
                        onClick={() => props.createObject(props.currentObject)}>
                    {props.editMode === 'create' ? 'Создать' : 'Редактировать'}
                </button>
            </div>
        </div>
    )
})

