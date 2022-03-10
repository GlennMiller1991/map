import {EventEmitter} from "events";
import {objectType} from "../types";
import React, {useCallback, useEffect, useState} from "react";
import styles from "../App.module.scss";

type EditSideBarPropsType = {
    emitter: EventEmitter,
    object: objectType,
    addObject: (obj: objectType) => void,
}
export const EditSideBar: React.FC<EditSideBarPropsType> = React.memo((props) => {
    console.log('from EditSideBar')
    const [currentObject, setCurrentObject] = useState<objectType>(props.object)

    useEffect(() => {
        setCurrentObject(props.object)
    }, [props.object])


    return (
        <div className={styles.editSideBar}>
            <div>
                Click on the map first
            </div>
            <div>
                Coords
                <br/>
                {
                    props.object && props.object.coords[0]
                }
            </div>
            <div>
                Address
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <div>
                Entrance
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <div>
                Telephone
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <div>
                Add square
                <br/>
                <input disabled={!currentObject && true}/>
            </div>
            <button onClick={() => props.addObject(currentObject)}>
                add object
            </button>
        </div>
    )
})