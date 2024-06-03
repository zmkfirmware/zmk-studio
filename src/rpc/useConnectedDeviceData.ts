
import React, { SetStateAction, useContext, useEffect, useState } from "react";
import { ConnectionContext } from "./ConnectionContext";

import { call_rpc, Request, RequestResponse } from "ts-zmk-rpc-core";

export function useConnectedDeviceData<T>(req: Omit<Request, "requestId">, response_mapper: (resp: RequestResponse) => T | undefined): [T | undefined, React.Dispatch<SetStateAction<T | undefined>>] {
    let connection = useContext(ConnectionContext);
    let [data, setData] = useState<T | undefined>(undefined);

    useEffect(() => {
        if (!connection) {
            setData(undefined);
            return;
        }

        async function startRequest() {
            setData(undefined);
            if (!connection) {
                return;
            }
            
            let response = response_mapper(await call_rpc(connection, req));
            
            if (!ignore) {
                setData(response);
            }
        }
        
        
        let ignore = false;
        startRequest();

        return () => { ignore = true; };
    }, [connection]);

    return [data, setData];
}