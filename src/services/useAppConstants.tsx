import { useEffect, useState } from "react";
import { supabaseClient } from "@digitalaidseattle/supabase";
import { useLoggingService } from "@digitalaidseattle/core";


export type AppConstant = {
    value: string,
    label: string
}
const cache: Record<string, AppConstant[]> = {}

const useAppConstants = (type: string) => {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState<AppConstant[]>([]);
    const loggingService = useLoggingService();

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = () => {
        setStatus('fetching');
        if (cache[type]) {
            const data = cache[type];
            setData(data);
            setStatus('fetched');
        } else {
            supabaseClient.from('app_constants')
                .select()
                .eq('type', type)
                .then(response => {
                    if (response.data) {
                        const data = response.data as AppConstant[];
                        cache[type] = data;
                        setData(data);
                        setStatus('fetched');
                    } else {
                        loggingService.error(response.statusText)
                        setData([]);
                        setStatus('fetched');
                    }
                })
        }
    };
    return { status, data };
};

export default useAppConstants;