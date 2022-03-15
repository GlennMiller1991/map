import React from "react";
import styles from "./ErrorMessage.module.scss";

type ErrorMessagePropsType = {
    message: string,
}
export const ErrorMessage: React.FC<ErrorMessagePropsType> = React.memo((props) => {

    return (
        <div className={styles.errorMessage}>
            <span className={styles.errorText}>
                {
                    props.message
                }. Попробуйте снова.
            </span>
        </div>
    )
})