/**
 * ShowLocalTimeContext.tsx
 *
 * holds context for whether to show local time or UTC time
 */
import { createContext } from "react"

interface ShowLocalTimeContextType {
    showLocalTime: boolean,
    setShowLocalTime: React.Dispatch<React.SetStateAction<boolean>>
}

export const ShowLocalTimeContext = createContext<ShowLocalTimeContextType>({
    showLocalTime: true,
    setShowLocalTime: () => true
})
