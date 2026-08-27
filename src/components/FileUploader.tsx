/**
 *  StudentUploader.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Typography } from "@mui/material";
import { MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_MB, UI_STRINGS } from "../constants";

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

function FileUploader({ onChange }: { onChange: (files: File[]) => Promise<void> }) {

    const onDrop = useCallback((files: File[]) => {
        // files here is only the accepted set - if everything was rejected
        // (e.g. too large), there's nothing to upload. Don't call onChange,
        // so the rejection message below stays visible instead of the parent
        // immediately switching to its upload/progress state.
        if (files.length > 0) {
            onChange(files)
        }
    }, [onChange])

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
        fileRejections
    } = useDropzone({
        onDrop,
        maxSize: MAX_UPLOAD_FILE_SIZE_BYTES,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        }
    });

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
            {fileRejections.length > 0 &&
                <Typography color="error" variant="body2" mt={1}>
                    {fileRejections
                        .map(({ file, errors }) => {
                            const reason = errors.some(e => e.code === 'file-too-large')
                                ? `${UI_STRINGS.FILE_TOO_LARGE_PREFIX} ${MAX_UPLOAD_FILE_SIZE_MB}MB`
                                : UI_STRINGS.FILE_INVALID_TYPE;
                            return `${file.name}: ${reason}`;
                        })
                        .join(', ')}
                </Typography>
            }
        </div>
    );
}


export default FileUploader;