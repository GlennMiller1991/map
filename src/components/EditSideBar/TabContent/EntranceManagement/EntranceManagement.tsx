import React from "react";
import styles from './EntranceManagement.module.scss'

import {pointCoordsType, TEditingObjectType, TEntranceEditMode} from "../../../../misc/types";
import EventEmitter from "events";
import {EVENT__CREATE_ENTRANCE, EVENT__DELETE_ENTRANCE} from "../../../../misc/constants";

type TEntranceManagementProps = {
    editMode: TEntranceEditMode,
    onButtonClickCallback: (value: TEntranceEditMode) => void,
    activeEntrance?: pointCoordsType,
    entranceCoords: Array<pointCoordsType>,
    updateObject: (obj: Partial<TEditingObjectType>) => void,
    emitterSideBar: EventEmitter,
}
export const EntranceManagement: React.FC<TEntranceManagementProps> = React.memo((props) => {

    const onMouseEnterEntranceCallback = (className: string) => {
        let elems = document.getElementsByClassName(className)
        if (elems.length) {
            let currentEntrance: HTMLImageElement = elems[0] as HTMLImageElement
            currentEntrance.style.width = '50px'
            currentEntrance.style.height = '50px'
            currentEntrance.style.top = '-20px'
            currentEntrance.style.left = '-10px'
        }
    }
    const onMouseLeaveEntranceCallback = (className: string) => {
        let elems = document.getElementsByClassName(className)
        if (elems.length) {
            let currentEntrance: HTMLImageElement = elems[0] as HTMLImageElement
            currentEntrance.style.width = '30px'
            currentEntrance.style.height = '30px'
            currentEntrance.style.top = '0'
            currentEntrance.style.left = '0'
        }
    }

    return (
        <div className={styles.entranceButtonsContainer}>
            <div className={styles.entrances}>
                <table>
                    <thead>
                    <tr>
                        <th/>
                        <th>Широта</th>
                        <th>Долгота</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Новый</td>
                        <td>
                            {
                                props.activeEntrance && props.activeEntrance[0].toFixed(7)
                            }
                        </td>
                        <td>
                            {
                                props.activeEntrance && props.activeEntrance[1].toFixed(7)
                            }
                        </td>
                        <td>
                            <button onClick={() => {
                                if (props.activeEntrance) {
                                    props.updateObject({entranceCoords: [...props.entranceCoords, props.activeEntrance]})
                                    props.emitterSideBar.emit(EVENT__CREATE_ENTRANCE, props.activeEntrance)
                                }
                            }}>Добавить</button>
                        </td>
                    </tr>
                    {
                        props.entranceCoords.map((entrance, key) => {
                            return (
                                <tr key={key}
                                    onMouseLeave={() => onMouseLeaveEntranceCallback(String(entrance))}
                                    onMouseEnter={() => onMouseEnterEntranceCallback(String(entrance))}>
                                    <td>{ key+1 }</td>
                                    <td>
                                        {entrance[0].toFixed(7)}
                                    </td>
                                    <td>
                                        {entrance[1].toFixed(7)}
                                    </td>
                                    <td>
                                        <button onClick={() => {
                                            props.emitterSideBar.emit(EVENT__DELETE_ENTRANCE, entrance)
                                            props.updateObject({entranceCoords:
                                                    props.entranceCoords.filter((entrance, index) => {
                                                        return index !== key
                                                    })
                                            })
                                        }}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
})