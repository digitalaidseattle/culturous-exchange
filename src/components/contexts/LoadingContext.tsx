/**
 *  LoadingContext.tsx
 * 
 *  Provides application wide loading indicator
 * 
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { ReactNode, createContext, useState } from 'react';

interface LoadingContextType {
    loading: boolean,
    setLoading: (loading: boolean) => void
}

export const LoadingContext = createContext<LoadingContextType>({
    loading: false,
    setLoading: () => {}
});

export const LoadingContextProvider = (props: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {props.children}
        </LoadingContext.Provider>
    );
};
