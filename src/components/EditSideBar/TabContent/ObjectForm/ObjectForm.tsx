import {objectType} from "../../../../misc/types";
import React from "react";
import {CustomInput} from "./CustomInput/CustomInput";
import {CustomSelect} from "./CustomSelect/CustomSelect";

type TObjectFormProps = {
    currentObject: objectType,
    updateObject: (object: Partial<objectType>) => void,
}
export const ObjectForm: React.FC<TObjectFormProps> = React.memo((props) => {
    return (
        <React.Fragment>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Название'}
                         value={props.currentObject.name}
                         keyName={'name'} callback={props.updateObject}/>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Телефон'} value={props.currentObject.telephone} keyName={'telephone'}
                         callback={props.updateObject}/>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Email'}
                         value={props.currentObject.email}
                         keyName={'email'}
                         callback={props.updateObject}/>
            <CustomInput disabled={!props.currentObject.coords.length}// || !!props.error}
                         text={'Площадь'} value={props.currentObject.square}
                         keyName={'square'}
                         callback={props.updateObject}/>
            <CustomSelect text={'Тип помещения'}
                          disabled={!props.currentObject.coords.length}// || !!props.error}
                          value={props.currentObject.classOfObject} keyName={'classOfObject'}
                          callback={props.updateObject}/>
        </React.Fragment>
    )
})