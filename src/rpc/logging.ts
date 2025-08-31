import { call_rpc, Request, RequestResponse, RpcConnection }from '@zmkfirmware/zmk-studio-ts-client';

export async function callRemoteProcedureControl(
    conn: RpcConnection,
    req: Omit<Request, 'requestId'>,
): Promise<RequestResponse> {
    // console.trace('RPC Request', conn, req);
    console.log(conn, req)
    return call_rpc(conn, req)
        .then((r) => {
            // console.log('RPC Response', r);
            return r;
        })
        .catch((e) => {
            // console.log('RPC Error', e);
            return e;
        });
}
