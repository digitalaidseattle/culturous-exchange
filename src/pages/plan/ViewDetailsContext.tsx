/**
 * ShowLocalTimeContext.tsx
 *
 * holds context for whether to show local time or UTC time
 */
import { createContext } from "react"


export type ViewDetails = {
    showGroupDetails: boolean,
    showStudentDetails: boolean,
}

interface ViewDetailsContextType {
    viewDetails: ViewDetails,
    setViewDetails: (v: ViewDetails) => void
}

export const ViewDetailsContext = createContext<ViewDetailsContextType>({
    viewDetails: { showGroupDetails: true, showStudentDetails: false },
    setViewDetails: () => { },
})
