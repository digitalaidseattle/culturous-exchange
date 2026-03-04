/**
 *  StudentUploader.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { UI_STRINGS } from "../../constants";

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

function Uploader({ onChange }: { onChange: (files: File[]) => Promise<void> }) {

    const onDrop = useCallback((files: File[]) => {
        onChange(files)
    }, [])

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject
    } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel': [] } });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    return (
        <div className="container">
            <div {...getRootProps({ style: style as React.CSSProperties })}>
                <input {...getInputProps()} />
                <p>{UI_STRINGS.DRAG_STUDENT_FILE}</p>
            </div>
        </div>
    );
}


export default Uploader;