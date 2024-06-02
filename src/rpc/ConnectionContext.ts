import { createContext } from "react";

import { RpcConnection } from "ts-zmk-rpc-core/index";

export const ConnectionContext = createContext<RpcConnection | null>(null);
