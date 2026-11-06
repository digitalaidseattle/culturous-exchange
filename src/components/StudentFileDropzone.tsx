/**
 *  StudentFileDropzone.tsx
 *
 *  A box to drag a student spreadsheet onto, or click to choose one. It holds one file; the
 *  chosen file's name is shown with a button to take it out again.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { CloseOutlined, FileExcelOutlined, UploadOutlined } from "@ant-design/icons";
import { Box, IconButton, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UI_STRINGS } from "../constants";

const SPREADSHEETS = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls']
};

export const StudentFileDropzone = (props: {
    file: File | null,
    onChange: (file: File | null) => void,
    disabled?: boolean,
    label: string
}) => {
    const { file, onChange, disabled, label } = props;
    const [rejected, setRejected] = useState<boolean>(false);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        accept: SPREADSHEETS,
        multiple: false,
        disabled,
        onDrop: (accepted, rejections) => {
            setRejected(accepted.length === 0 && rejections.length > 0);
            if (accepted.length > 0) {
                onChange(accepted[0]);
            }
        }
    });

    return (
        <Box>
            <Box
                {...getRootProps()}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    minHeight: 96,
                    padding: 2,
                    borderRadius: 1,
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: isDragReject || rejected ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
                    bgcolor: (theme) => isDragActive ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.primary.main, 0.03),
                    color: 'text.secondary',
                    cursor: disabled ? 'default' : 'pointer',
                    textAlign: 'center',
                    outlineOffset: 2
                }}>
                <input {...getInputProps({ 'aria-label': label })} />
                {file
                    ? (
                        <>
                            <FileExcelOutlined style={{ fontSize: 24 }} />
                            <Typography sx={{ color: 'text.primary', fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</Typography>
                            <IconButton
                                size="small"
                                aria-label={UI_STRINGS.REMOVE_FILE}
                                disabled={disabled}
                                // taking the file out must not also open the file chooser
                                onClick={(event) => { event.stopPropagation(); setRejected(false); onChange(null); }}>
                                <CloseOutlined />
                            </IconButton>
                        </>)
                    : (
                        <>
                            <UploadOutlined style={{ fontSize: 24 }} />
                            <Typography>{UI_STRINGS.DROP_STUDENT_FILE}</Typography>
                        </>)}
            </Box>
            {rejected &&
                <Typography role="alert" variant="caption" color="error">{UI_STRINGS.ONLY_EXCEL_FILES}</Typography>
            }
        </Box>
    );
};
