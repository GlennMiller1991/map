import React, {ChangeEvent, useEffect, useState} from "react";
import {objectClassType, objectType} from "../../../misc/types";
import styles from "../../../App.module.scss";

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