
import React, { SetStateAction, useContext, useEffect, useState } from "react";
import { ConnectionContext } from "./ConnectionContext";

import { call_rpc, Request, Response } from "ts-zmk-rpc-core";

export function useConnectedDeviceData<T>(req: Request, response_mapper: (resp: Response) => T): [T | null, React.Dispatch<SetStateAction<T | null>>] {
    let connection = useContext(ConnectionContext);
    let [data, setData] = useState<T | null>(null);

    useEffect(() => {
        if (!connection) {
            setData(null);
            return;
        }

        async function startRequest() {
            setData(null);
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