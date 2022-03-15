import React from "react";
import styles from "../EditSideBar.module.scss";
import {AddressInput} from "./AddressInput/AddressInput";
import {drawingClassType, objectType, pointCoordsType} from "../../../misc/types";
import EventEmitter from "events";
import {TEditMode} from "../EditSideBar";
import {ObjectForm} from "./ObjectForm/ObjectForm";

export type TTabContentProps = {
    setMarkerOnCoords: (coords: pointCoordsType) => void,
    editMode: TEditMode,
    emitterSideBar: EventEmitter,
    currentObject: objectType,
    sendDrawModeToMap: (value: drawingClassType) => void,
    drawMode: drawingClassType,
    changeDrawMode: (value: drawingClassType) => void,
    createObject: (obj: objectType) => void,
    updateObject: (obj: Partial<objectType>) => void,
    deleteObject: (id: string) => void,
}
export const TabContent: React.FC<TTabContentProps> = React.memo((props) => {

    return (
        <div className={styles.tabContent}>
            <div className={styles.controlContainer}>
                <button className={`${styles.control} ${props.drawMode === 'position' ?
                    styles.active :
                    ''}`}
                        disabled={props.editMode === 'update' && props.currentObject.id === '-1'}
                        onClick={() => props.changeDrawMode('position')}>
                    POS
                </button>
                <button className={`${styles.control} ${props.drawMode === 'naming' ?
                    styles.active :
                    ''}`}
                        onClick={() => props.changeDrawMode('naming')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    NAM
                </button>
                <button className={`${styles.control} ${props.drawMode === 'entrance' ?
                    styles.active :
                    ''}`}
                        onClick={() => props.changeDrawMode('entrance')}
                        disabled={!props.currentObject.coords.length /*|| !!props.error*/}>
                    ENT
                </button>
                <button className={`${styles.control} ${props.drawMode === 'square' ?
                    styles.active :
                    ''}`}
                        onClick={() => props.changeDrawMode("square")}
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