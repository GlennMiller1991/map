import {coordsType, drawingClassType, objectType, pointCoordsType} from "../../misc/types";
import React, {useCallback, useEffect, useState} from "react";
import styles from "../../App.module.scss";
import EventEmitter from "events";
import {CustomSelect} from "./CustomSelect/CustomSelect";
import {CustomInput} from "./CustomInput/CustomInput";
import {AddressInput} from "./AddressInput/AddressInput";

type TEditSideBarPropsType = {
    emitterSideBar: EventEmitter,
    emitterMap: EventEmitter,
    object: objectType,
    callback: (obj: objectType) => void,
    isNew: boolean,
    deleteObject: (id: string) => void,
    error: string,
    setError: (error: string) => void,
}
export const EditSideBar: React.FC<TEditSideBarPropsType> = React.memo((props) => {
    console.log('from edit sidebar')

    // state
    const [currentObject, setCurrentObject] = useState<objectType>(props.object)
    const [drawMode, setDrawMode] = useState<drawingClassType>('defaultTypes')
    const [isNew, setIsNew] = useState(props.isNew)

    const updateObject = useCallback((obj: Partial<objectType>) => {
        setCurrentObject({...currentObject, ...obj})
    }, [currentObject])
    const changeDrawMode = (mode: drawingClassType) => {
        const nextMode = drawMode === mode ? 'defaultTypes' : mode
        setDrawMode(nextMode)
        props.emitterSideBar.emit('changeDrawMode', nextMode)
    }
    const setMarkerOnCoords = (coords: pointCoordsType) => {
        props.emitterSideBar.emit('createMarker', coords)
    }

    //validators
    const emailVal = (value: string) => {
        return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
    }

    //useEffects
    useEffect(() => {
        setIsNew(props.isNew)
    }, [props.isNew])
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
        setDrawMode('defaultTypes')
        props.emitterSideBar.emit('changeDrawMode', 'defaultTypes')
        setCurrentObject(props.object)
    }, [props.object, props.emitterSideBar])

    return (
        <div className={styles.editSideBar}>
            <div className={styles.container}>
                {
                    isNew ?
                        <h3>Создать объект</h3> :
                        <h3>Редактировать объект</h3>
                }
                <div className={styles.controlContainer}>
                    {
                        isNew &&

                        <button className={`${styles.control} ${drawMode === 'defaultTypes' ?
                            styles.active :
                            ''}`}
                                onClick={() => changeDrawMode('defaultTypes')}
                        >
                            POS
                        </button>
                    }

                    <button className={`${styles.control} ${drawMode === 'entrance' ?
                        styles.active :
                        ''}`}
                            onClick={() => changeDrawMode('entrance')}
                            disabled={!currentObject.coords.length || !!props.error}>
                        ENT
                    </button>
                    <button className={`${styles.control} ${drawMode === 'square' ?
                        styles.active :
                        ''}`}
                            onClick={() => changeDrawMode("square")}
                            disabled={!currentObject.coords.length || !!props.error}>
                        SQU
                    </button>
                    <button className={styles.control}
                            onClick={() => props.deleteObject(currentObject.id)}>
                        DEL
                    </button>

                </div>
                <div className={styles.inputsContainer}>
                    <CustomInput disabled={!currentObject.coords.length || !!props.error}
                                 text={'Название'}
                                 value={currentObject.name}
                                 keyName={'name'} callback={updateObject}/>
                    <AddressInput setMarker={setMarkerOnCoords}
                                  text={'Адрес'}
                                  value={currentObject.address}
                                  keyName={'address'}
                                  callback={updateObject}
                                  disabled={false}
                                  setError={props.setError}/>
                    {/*<CustomInput disabled={false}*/}
                    {/*             onChangeHandler={onChangeAddressCallback}*/}
                    {/*             text={'Адрес'} value={currentObject.address} keyName={'address'}*/}
                    {/*             callback={updateObject}/>*/}
                    <CustomInput disabled={!currentObject.coords.length || !!props.error}
                                 text={'Телефон'} value={currentObject.telephone} keyName={'telephone'}
                                 callback={updateObject}/>
                    <CustomInput disabled={!currentObject.coords.length || !!props.error}
                                 text={'Email'}
                                 value={currentObject.email}
                                 keyName={'email'}
                                 callback={updateObject}
                                 validation={emailVal}/>
                    <CustomInput disabled={!currentObject.coords.length || !!props.error}
                                 text={'Площадь'} value={currentObject.square}
                                 keyName={'square'}
                                 callback={updateObject}/>
                    <CustomSelect text={'Тип помещения'}
                                  disabled={!currentObject.coords.length || !!props.error}
                                  value={currentObject.classOfObject} keyName={'classOfObject'}
                                  callback={updateObject}/>
                </div>
                <div>
                    <button className={styles.updateBtn}
                            disabled={currentObject.id === '-1' || !!props.error}
                            onClick={() => props.callback(currentObject)}>
                        {isNew ? 'Создать' : 'Редактировать'}
                    </button>
                </div>
            </div>
        </div>
    )
})

