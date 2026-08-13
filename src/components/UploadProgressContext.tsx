/**
 *  UploadProgressContext.tsx
 *
 *  Tracks in-flight spreadsheet uploads at the App level (above the router),
 *  so progress survives navigating to a different page mid-upload (CEMT-151).
 *  The upload itself already keeps running in the background regardless -
 *  this only fixes the UI losing visibility into it.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UploadTask = {
    id: string;
    label: string;
    completed: number;
    total: number;
};

interface UploadProgressContextType {
    uploads: UploadTask[];
    startUpload: (id: string, label: string) => void;
    updateUpload: (id: string, completed: number, total: number) => void;
    finishUpload: (id: string) => void;
}

const UploadProgressContext = createContext<UploadProgressContextType>({
    uploads: [],
    startUpload: () => { },
    updateUpload: () => { },
    finishUpload: () => { },
});

export const UploadProgressProvider = (props: { children: React.ReactNode }) => {
    const [uploads, setUploads] = useState<UploadTask[]>([]);

    const startUpload = useCallback((id: string, label: string) => {
        setUploads(prev => [...prev.filter(u => u.id !== id), { id, label, completed: 0, total: 0 }]);
    }, []);

    const updateUpload = useCallback((id: string, completed: number, total: number) => {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, completed, total } : u));
    }, []);

    const finishUpload = useCallback((id: string) => {
        setUploads(prev => prev.filter(u => u.id !== id));
    }, []);

    // Warn before an accidental refresh/close while an upload is still
    // running - a real reload kills the in-flight work with no way to resume
    // or tell what got through (CEMT-151), unlike just switching pages.
    useEffect(() => {
        if (uploads.length === 0) {
            return;
        }
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [uploads.length]);

    const value = useMemo(
        () => ({ uploads, startUpload, updateUpload, finishUpload }),
        [uploads, startUpload, updateUpload, finishUpload]
    );

    return (
        <UploadProgressContext.Provider value={value}>
            {props.children}
        </UploadProgressContext.Provider>
    );
};

export const useUploadProgress = () => useContext(UploadProgressContext);
