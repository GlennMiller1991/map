import React, {useEffect} from "react";
import styles from "./ErrorMessage.module.scss";

type ErrorMessagePropsType = {
    message: string,
    removeMessage: (value: string) => void,
}
export const ErrorMessage: React.FC<ErrorMessagePropsType> = React.memo((props) => {

    useEffect(() => {
        setTimeout(() => {
            props.removeMessage('')
        }, 10000)
    }, [props.removeMessage])

    return (
        <div className={styles.errorMessage}>
            <span className={styles.errorText}>
                {
                    props.message
                }
            </span>
        </div>
    )
})