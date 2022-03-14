import React, {ChangeEvent, useEffect, useState} from "react";
import styles from "../../../App.module.scss";
import {objectType} from "../../../types";

type CustomInputPropsType = {
    text: string,
    value: string,
    keyName: string,
    callback: (obj: Partial<objectType>) => void,
    validation?: (value: string) => boolean,
    errorMsg?: string,
    disabled: boolean,
    onChangeHandler?: (value: string) => void,
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
    const onBlurHandler = () => {
        let error = onValidationHandler(value)
        if (!error) props.callback({[props.keyName]: value})
    }

    const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        let value = event.currentTarget.value
        props.onChangeHandler && props.onChangeHandler(value)
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
                <input disabled={props.disabled} style={error ? {border: '1px solid red'} : {}}
                       value={value}
                       onChange={onChangeHandler}
                       onBlur={onBlurHandler}
                />
            </div>
        </div>
    )
})