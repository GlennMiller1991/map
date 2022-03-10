import {drawingClassType, objectType} from "../types";
import React, {useEffect, useRef, useState} from "react";
import styles from "../App.module.scss";
import EventEmitter from "events";

type EditSideBarPropsType = {
    emitter: EventEmitter,
    object: objectType,
    callback: (obj: objectType) => void,
    changeDrawMode: (draw_class: drawingClassType) => void,
}
export const EditSideBar: React.FC<EditSideBarPropsType> = React.memo((props) => {
    console.log('from EditSideBar')
    const [currentObject, setCurrentObject] = useState<objectType>(props.object)
    let currentDrawMode = useRef<drawingClassType>('defaultTypes')

    const updateObject = (obj: Partial<objectType>) => {
        setCurrentObject({...currentObject, ...obj})
    }

    const changeDrawMode = () => {
        const nextMode = currentDrawMode.current === 'defaultTypes' ? 'entrance' : 'defaultTypes'
        currentDrawMode.current = nextMode
        props.changeDrawMode(nextMode)
    }

    useEffect(() => {
        props.emitter.addListener('updateEntrance', () => {

        })
        return () => {
            props.emitter.removeAllListeners()
        }
    }, [props.emitter])


    useEffect(() => {
        console.log(props.object)
        setCurrentObject(props.object)
    }, [props.object])


    return (
        <div className={styles.editSideBar}>
            <div>
                Click on the map first
            </div>
            <CustomInput text={'Название'} value={currentObject.name} keyName={'name'} callback={updateObject}/>
            <CustomInput text={'Адрес'} value={currentObject.address} keyName={'address'} callback={updateObject}/>
            <CustomInput text={'Телефон'} value={currentObject.telephone} keyName={'telephone'} callback={updateObject}/>
            <CustomInput text={'Площадь'} value={currentObject.square} keyName={'square'} callback={updateObject}/>
            <div>
                Add square
                <br/>
                <input disabled={currentObject.id === '-1'}/>
            </div>
            <div>
                <button onClick={changeDrawMode}>Указать вход</button>
            </div>
            <button disabled={currentObject.id === '-1'}
                    onClick={() => props.callback(currentObject)}>
                update object
            </button>
        </div>
    )
})

type CustomInputPropsType = {
    text: string,
    value: string,
    keyName: string,
    callback: (obj: Partial<objectType>) => void
}
export const CustomInput: React.FC<CustomInputPropsType> = React.memo((props) => {
    const [value, setValue] = useState(props.value)
    const onBlurHanlder = () => {
        props.callback({[props.keyName]: value})
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