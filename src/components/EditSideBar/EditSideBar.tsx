import {coordsType, drawingClassType, objectType, pointCoordsType} from "../../types";
import React, {ChangeEvent, useCallback, useEffect, useState} from "react";
import styles from "../../App.module.scss";
import EventEmitter from "events";
import {doubleGisRestApi, TItems, TSearchResponse} from "../../rest_api/restApi";
import {CustomSelect} from "./CustomSelect/CustomSelect";
import {CustomInput} from "./CustomInput/CustomInput";
import {getCoordsFromString} from "../../utils/getCoordsFromString";

type EditSideBarPropsType = {
    emitterSideBar: EventEmitter,
    emitterMap: EventEmitter,
    object: objectType,
    callback: (obj: objectType) => void,
    isNew: boolean,
    deleteObject: (id: string) => void,
}
export const EditSideBar: React.FC<EditSideBarPropsType> = React.memo((props) => {
    const [currentObject, setCurrentObject] = useState<objectType>(props.object)
    const [drawMode, setDrawMode] = useState<drawingClassType>('defaultTypes')
    const [isNew, setIsNew] = useState(props.isNew)

    console.log('from edit sidebar')
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
                            disabled={!currentObject.coords.length}>
                        ENT
                    </button>
                    <button className={`${styles.control} ${drawMode === 'square' ?
                        styles.active :
                        ''}`}
                            onClick={() => changeDrawMode("square")}
                            disabled={!currentObject.coords.length}>
                        SQU
                    </button>
                    <button className={styles.control}
                            onClick={() => props.deleteObject(currentObject.id)}>
                        DEL
                    </button>

                </div>
                <div className={styles.inputsContainer}>
                    <CustomInput disabled={!currentObject.coords.length}
                                 text={'Название'}
                                 value={currentObject.name}
                                 keyName={'name'} callback={updateObject}/>
                    <AddressInput setMarker={setMarkerOnCoords}
                                  text={'Адрес'}
                                  value={currentObject.address}
                                  keyName={'address'}
                                  callback={updateObject}
                                  disabled={false}/>
                    {/*<CustomInput disabled={false}*/}
                    {/*             onChangeHandler={onChangeAddressCallback}*/}
                    {/*             text={'Адрес'} value={currentObject.address} keyName={'address'}*/}
                    {/*             callback={updateObject}/>*/}
                    <CustomInput disabled={!currentObject.coords.length}
                                 text={'Телефон'} value={currentObject.telephone} keyName={'telephone'}
                                 callback={updateObject}/>
                    <CustomInput disabled={!currentObject.coords.length}
                                 text={'Email'}
                                 value={currentObject.email}
                                 keyName={'email'}
                                 callback={updateObject}
                                 validation={emailVal}/>
                    <CustomInput disabled={!currentObject.coords.length}
                                 text={'Площадь'} value={currentObject.square}
                                 keyName={'square'}
                                 callback={updateObject}/>
                    <CustomSelect text={'Тип помещения'} disabled={!currentObject.coords.length}
                                  value={currentObject.classOfObject} keyName={'classOfObject'}
                                  callback={updateObject}/>
                </div>
                <div>
                    <button className={styles.updateBtn}
                            disabled={currentObject.id === '-1'}
                            onClick={() => props.callback(currentObject)}>
                        {isNew ? 'Создать' : 'Редактировать'}
                    </button>
                </div>
            </div>
        </div>
    )
})

type TAddressInputProps = {
    text: string,
    value: string,
    keyName: string,
    callback: (obj: Partial<objectType>) => void,
    disabled: boolean,
    setMarker: (coords: pointCoordsType) => void,
}
export const AddressInput: React.FC<TAddressInputProps> = React.memo((props) => {
    const [value, setValue] = useState(props.value)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    console.log(suggestions)
    const onBlurHandler = () => {
        setShowSuggestions(false)
        props.callback({[props.keyName]: value})
        debugger
        doubleGisRestApi.getSuggestion(suggestions[0])
            .then((response: TSearchResponse) => {
                if (response.meta.code === 200) {
                    doubleGisRestApi.getCoords(response.result.items[0].id)
                        .then((response: any) => {
                            props.setMarker(getCoordsFromString(response.result.items[0].geometry.centroid))
                        })
                } else {
                    console.log(response)
                }
            })
    }
    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        let value = event.currentTarget.value
        doubleGisRestApi.getSuggestion(value)
            .then((response: TSearchResponse) => {
                if (response.meta.code === 200) {
                    let results = response.result.items.map(object => {
                        let result = object.full_address_name ? object.full_address_name :
                            object.address_name ? object.address_name :
                                object.name
                        return result
                    })
                    setSuggestions(results)
                } else {
                    setSuggestions(['Нет совпадений'])
                }
            })
        setValue(value)
    }

    useEffect(() => {
        setValue(props.value)
    }, [props.value])
    return (
        <div className={styles.inputContainer}>
            <div className={styles.inputLabel}>
                {props.text}
            </div>
            <div className={styles.input}>
                <input disabled={props.disabled}
                       onFocus={() => {
                           setShowSuggestions(true)
                       }}
                       value={value}
                       onChange={onChangeHandler}
                       onBlur={onBlurHandler}
                />
            </div>
        </div>
    )
})