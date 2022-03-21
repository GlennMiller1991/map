import React from "react";
import styles from "../EditSideBar.module.scss";
import {AddressInput} from "./AddressInput/AddressInput";
import {drawingClassType, objectType, pointCoordsType, TEditingObjectType} from "../../../misc/types";
import EventEmitter from "events";
import {TEditMode} from "../EditSideBar";
import {ObjectForm} from "./ObjectForm/ObjectForm";

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

    const onChangeDrawModeExtension = (drawMode: drawingClassType) => {
        // additional function that invokes in changingDrawMode function
        // this function is calling always in change draw mode
        // but not always there is changeMarkerDraggableMode.
        // changeMarkerDraggableMode is creating only in update mode of side bar
        // and is giving only with updatable object
        props.currentObject.changeMarkerDraggableMode &&
        props.currentObject.changeMarkerDraggableMode(drawMode === 'position')
    }

    const onPositionClickCallback = (drawMode: drawingClassType) => {
        // function for making invoke simpler
        props.changeDrawMode(drawMode, props.editMode, onChangeDrawModeExtension)
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.controlContainer}>
                <button className={`
                ${styles.control} 
                ${props.drawMode === 'position' ?
                    styles.active : ''}
                    `}
                        disabled={props.editMode === 'update' && props.currentObject.id === '-1'}
                        onClick={() => onPositionClickCallback('position')}>
                    POS
                </button>
                <button className={`${styles.control} ${props.drawMode === 'naming' ?
                    styles.active :
                    ''}`}
                        onClick={() => onPositionClickCallback('naming')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    NAM
                </button>
                <button className={`${styles.control} ${props.drawMode === 'entrance' ?
                    styles.active :
                    ''}`}
                        onClick={() => onPositionClickCallback('entrance')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    ENT
                </button>
                <button className={`${styles.control} ${props.drawMode === 'square' ?
                    styles.active :
                    ''}`}
                        onClick={() => onPositionClickCallback('square')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    SQU
                </button>
                <button className={styles.control}
                        onClick={() => props.deleteObject(props.currentObject.id)}>
                    DEL
                </button>
            </div>
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