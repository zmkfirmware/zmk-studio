import { createContext } from "react";

import { RpcConnection } from "@zmkfirmware/zmk-studio-ts-client/index";

export const ConnectionContext = createContext<RpcConnection | null>(null);
