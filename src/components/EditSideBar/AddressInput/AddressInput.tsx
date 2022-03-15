import {objectType, pointCoordsType} from "../../../misc/types";
import React, {ChangeEvent, useEffect, useState} from "react";
import {doubleGisRestApi, TSearchResponse} from "../../../rest_api/restApi";
import {getCoordsFromString} from "../../../utils/getCoordsFromString";
import styles from "../../../App.module.scss";

type TAddressInputProps = {
    text: string,
    value: string,
    keyName: string,
    callback: (obj: Partial<objectType>) => void,
    disabled: boolean,
    setMarker: (coords: pointCoordsType) => void,
    setError: (error: string) => void,
}
export const AddressInput: React.FC<TAddressInputProps> = React.memo((props) => {

    // state
    const [value, setValue] = useState(props.value)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

    // callbacks
    const onBlurHandler = () => {
        setShowSuggestions(false)
        props.callback({[props.keyName]: value})
        doubleGisRestApi.getSuggestion(suggestions[0])
            .then((response: TSearchResponse) => {
                if (response.meta.code === 200) {
                    doubleGisRestApi.getCoords(response.result.items[0].id)
                        .then((response: any) => {
                            props.setMarker(getCoordsFromString(response.result.items[0].geometry.centroid))
                        })
                } else {
                    props.setError('Здание не найдено')
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