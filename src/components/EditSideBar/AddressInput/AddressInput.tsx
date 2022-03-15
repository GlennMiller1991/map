import {objectType, pointCoordsType} from "../../../misc/types";
import React, {ChangeEvent, useEffect, useState} from "react";
import {doubleGisRestApi, TSearchResponse} from "../../../rest_api/restApi";
import {getCoordsFromString} from "../../../utils/getCoordsFromString";
import styles from './../EditSideBar.module.scss'
import {RESPONSE_SUCCESS} from "../../../misc/constants";
import {debug} from "util";

type TAddressInputProps = {
    value: string,
    callback?: (obj: Partial<objectType>) => void,
    disabled?: boolean,
    setMarker: (coords: pointCoordsType) => void,
    setError?: (error: string) => void,
}
export const AddressInput: React.FC<TAddressInputProps> = React.memo((props) => {

        // state
        const [value, setValue] = useState(props.value)
        const [suggestions, setSuggestions] = useState<Array<{ name: string, id: string }>>([])
        const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

        const onSuggestionClick = (value: string, id: string) => {
            if (id !== '-2') {
                setValue(value)
                setShowSuggestions(false)
                doubleGisRestApi.getCoords(id)
                    .then((response: TSearchResponse) => {
                        // if there is info about object
                        // update current editing object
                        // get coords from info
                        // and then set marker on the map
                        if (response.meta.code === RESPONSE_SUCCESS) {
                            props.setMarker(getCoordsFromString(response.result.items[0].geometry.centroid))
                        } else {
                            // props.setError('something went wrong')
                        }
                    })
            }
        }

        // callbacks
        const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            let value = event.currentTarget.value
            doubleGisRestApi.getSuggestion(value)
                .then((response: TSearchResponse) => {
                    if (response.meta.code === 200) {
                        let results = response.result.items.map(object => {
                            let name = object.full_address_name ? object.full_address_name :
                                object.address_name ? object.address_name :
                                    object.name
                            let id = object.id
                            return {name, id}
                        })
                        setSuggestions(results)
                    } else {
                        setSuggestions([{name: 'Нет совпадений', id: '-2'}])
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
                    Адресс
                </div>
                <div className={styles.input}>
                    <input autoFocus
                           disabled={props.disabled}
                           onFocus={() => {
                               setShowSuggestions(true)
                           }}
                           value={value}
                           onChange={onChangeHandler}
                        // onBlur={onBlurHandler}
                    />
                </div>
                {
                    showSuggestions &&
                    <div className={styles.suggestionsContainer}>
                        {
                            suggestions.map((suggestion, id) => {
                                return (
                                    <div className={styles.suggestion}
                                         key={id} onClick={() => onSuggestionClick(suggestion.name, suggestion.id)}>
                                        {
                                            suggestion.name
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                }
            </div>
        )
    }
)