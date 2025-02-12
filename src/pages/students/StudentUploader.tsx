/**
 *  StudentUploader.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { studentService } from "../../api/ceStudentService";
import { Student } from "../../api/types";

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

function StudentUploader(props: any) {

    const onDrop = useCallback((studentFiles: File[]) => {
        Promise
            .all(studentFiles.map(file => studentService.insert_from_excel(file)))
            .then(resps => {
                let allFailed: Student[] = [];
                resps.forEach(resp => {
                    allFailed = allFailed.concat(resp.failedStudents);
                })
                const allSuccess = resps.map(resp => resp.successCount)
                    .reduce((p, v) => p + v, 0);
                props.onChange({
                    failedStudents: allFailed,
                    successCount: allSuccess
                });
            });
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
                <p>Drag the student file here, or click to select the file</p>
            </div>
        </div>
    );
}


export default StudentUploader;