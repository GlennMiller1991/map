import {coordsType, drawingClassType, objectClassType, objectType} from "../../types";
import React, {ChangeEvent, useCallback, useEffect, useState} from "react";
import styles from "../../App.module.scss";
import EventEmitter from "events";

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

    //validators
    const emailVal = (value: string) => {
        return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
    }

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
                    <CustomInput disabled={!currentObject.coords.length}
                                 text={'Адрес'} value={currentObject.address} keyName={'address'}
                                 callback={updateObject}/>
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
                    <CustomSelect text={'Тип помещения'} disabled={!currentObject.coords.length} value={currentObject.classOfObject} keyName={'classOfObject'}
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

type CustomInputPropsType = {
    text: string,
    value: string,
    keyName: string,
    callback: (obj: Partial<objectType>) => void,
    validation?: (value: string) => boolean,
    errorMsg?: string,
    disabled: boolean,
}
export const CustomInput: React.FC<CustomInputPropsType> = React.memo((props) => {
    const [value, setValue] = useState(props.value)
    const [error, setError] = useState(false)

    const onValidationHandler = (value: string) => {
        if (props.validation) {
            let error = props.validation(value)
            setError(error)
            return error
        }
    }
    const onBlurHanlder = () => {
        debugger
        let error = onValidationHandler(value)
        if (!error) props.callback({[props.keyName]: value})
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
                <input disabled={props.disabled} style={error ? {border: '1px solid red'} : {}}
                       value={value}
                       onChange={(event) => {
                           setValue(event.currentTarget.value)
                       }}
                       onBlur={onBlurHanlder}
                />
            </div>
        </div>
    )
})

type CustomSelectPropsType = {
    text: string,
    value: objectClassType,
    keyName: string,
    callback: (obj: Partial<objectType>) => void,
    disabled: boolean,
}
export const CustomSelect: React.FC<CustomSelectPropsType> = React.memo((props) => {

    const [value, setValue] = useState<objectClassType>(props.value)

    const onChangeHandler = (event: ChangeEvent<HTMLSelectElement>) => {
        props.callback({
            [props.keyName]: event.currentTarget.value
        })
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
                <select disabled={props.disabled} className={styles.select} value={value} onChange={onChangeHandler}>
                    <option value={undefined}>прочее</option>
                    <option value={'office'}>оффис</option>
                    <option value={'shop'}>магазин</option>
                    <option value={'storage'}>склад</option>
                </select>
            </div>
        </div>
    )
})