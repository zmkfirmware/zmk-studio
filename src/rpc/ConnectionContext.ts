import { createContext } from "react";

import { RpcConnection } from "zmk-studio-ts-client/index";

export const ConnectionContext = createContext<RpcConnection | null>(null);
