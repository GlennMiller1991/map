import {coordsType, drawingClassType, objectClassType, objectType} from "../types";
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import styles from "../App.module.scss";
import EventEmitter from "events";

type EditSideBarPropsType = {
    emitterSideBar: EventEmitter,
    emitterMap: EventEmitter,
    object: objectType,
    callback: (obj: objectType) => void,
    isNew: boolean,
}
export const EditSideBar: React.FC<EditSideBarPropsType> = React.memo((props) => {
    const [currentObject, setCurrentObject] = useState<objectType>(props.object)
    const [isNew, setIsNew] = useState(props.isNew)
    let currentDrawMode = useRef<drawingClassType>('defaultTypes')

    const updateObject = useCallback((obj: Partial<objectType>) => {
        setCurrentObject({...currentObject, ...obj})
    }, [currentObject])
    const changeDrawMode = (mode: drawingClassType) => {
        const nextMode = currentDrawMode.current === mode ? 'defaultTypes' : mode
        currentDrawMode.current = nextMode
        props.emitterSideBar.emit('changeDrawMode', nextMode)
    }

    useEffect(() => {
        console.log(props.isNew)
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
        currentDrawMode.current = 'defaultTypes'
        props.emitterSideBar.emit('changeDrawMode', currentDrawMode.current)
        setCurrentObject(props.object)
    }, [props.object])

    return (
        <div className={styles.editSideBar}>
            <div className={styles.container}>
                {
                    isNew ?
                        <div>Создать объект</div> :
                        <div>Редактировать объект</div>
                }

                {
                    isNew &&
                    <div>
                        <button onClick={() => changeDrawMode('defaultTypes')}>Редактировать положение объекта</button>
                    </div>
                }

                <div>
                    <button onClick={() => changeDrawMode('entrance')}>Указать вход</button>
                </div>
                <div>
                    <button onClick={() => changeDrawMode("square")}>Указать территорию</button>
                </div>
                <CustomInput text={'Название'} value={currentObject.name} keyName={'name'} callback={updateObject}/>
                <CustomInput text={'Адрес'} value={currentObject.address} keyName={'address'} callback={updateObject}/>
                <CustomInput text={'Телефон'} value={currentObject.telephone} keyName={'telephone'}
                             callback={updateObject}/>
                <CustomInput text={'Email'} value={currentObject.email} keyName={'email'} callback={updateObject}/>
                <CustomInput text={'Площадь'} value={currentObject.square} keyName={'square'} callback={updateObject}/>
                <CustomSelect text={'Тип помещения'} value={currentObject.classOfObject} keyName={'classOfObject'}
                              callback={updateObject}/>
                <button disabled={currentObject.id === '-1'}
                        onClick={() => props.callback(currentObject)}>
                    update object
                </button>
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
}
export const CustomInput: React.FC<CustomInputPropsType> = React.memo((props) => {
    const [value, setValue] = useState(props.value)
    const onBlurHanlder = () => {
        let res = true
        if (props.validation) res = props.validation(value)
        if (res) props.callback({[props.keyName]: value})
    }

    useEffect(() => {
        setValue(props.value)
    }, [props.value])
    return (
        <div>
            {props.text}
            <br/>
            <input value={value}
                   onChange={(event) => {
                       setValue(event.currentTarget.value)
                   }}
                   onBlur={onBlurHanlder}
            />
        </div>
    )
})

type CustomSelectPropsType = {
    text: string,
    value: objectClassType,
    keyName: string,
    callback: (obj: Partial<objectType>) => void,
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
        <div>
            {props.text}
            <br/>
            <select value={value} onChange={onChangeHandler}>
                <option value={'office'}>оффис</option>
                <option value={'shop'}>магазин</option>
                <option value={'storage'}>склад</option>
            </select>
        </div>
    )
})