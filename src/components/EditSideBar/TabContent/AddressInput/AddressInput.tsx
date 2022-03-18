import {objectType, pointCoordsType} from "../../../../misc/types";
import React, {ChangeEvent, useEffect, useState} from "react";
import {doubleGisRestApi, TSearchResponse} from "../../../../rest_api/restApi";
import {getCoordsFromString} from "../../../../utils/getCoordsFromString";
import styles from '../../EditSideBar.module.scss'
import {fakeID, RESPONSE__SUCCESS} from "../../../../misc/constants";

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

        // callbacks
        const onSuggestionClick = (value: string, id: string) => {
            if (id !== fakeID) {
                setValue(value)
                setShowSuggestions(false)
                doubleGisRestApi.getCoords(id)
                    .then((response: TSearchResponse) => {
                        // if there is info about object
                        // update current editing object
                        // get coords from info
                        // and then set marker on the map
                        if (response.meta.code === RESPONSE__SUCCESS) {
                            props.setMarker(getCoordsFromString(response.result.items[0].geometry.centroid))
                        }
                    })
            }
        }
        const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
            // suggestions appear only after change input field

            // get value from input
            let value = event.currentTarget.value
            // try to receive suggestions on value from 2gis api
            doubleGisRestApi.getSuggestion(value)
                .then((response: TSearchResponse) => {
                    if (response.meta.code === RESPONSE__SUCCESS) {
                        // if okay
                        // try to get full address / just address / just name
                        // get 2gis id and set name + id to state
                        // else unclickable fake object to state
                        let results = response.result.items.map(object => {
                            let name = object.full_address_name ? object.full_address_name :
                                object.address_name ? object.address_name :
                                    object.name
                            let id = object.id
                            return {name, id}
                        })
                        setSuggestions(results)
                    } else {
                        setSuggestions([{name: 'Нет совпадений', id: fakeID}])
                    }
                })
                .catch()   // not implemented
            setValue(value)
        }

        useEffect(() => {
            // looking for new address
            setValue(props.value)
            setSuggestions([])
        }, [props.value])
        return (
            <div className={styles.inputContainer}>
                <div className={styles.inputLabel}>
                    Адрес
                </div>
                <div className={styles.input}>
                    <input autoFocus
                           disabled={props.disabled}
                           onFocus={() => {
                               setShowSuggestions(true)
                           }}
                           value={value}
                           onChange={onChangeHandler}
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