/**
 *  TimeWindowSelectionContext.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { createContext } from "react"

interface TimeWindowContextType {
    selection: string[],
    setSelection: React.Dispatch<React.SetStateAction<string[]>>
}

export const TimeWindowSelectionContext = createContext<TimeWindowContextType>({
    selection: [] as string[],
    setSelection: () => []
})
