
use futures::lock::Mutex;
use futures::Sink;
use futures::SinkExt;

use futures::channel::mpsc::SendError;

use serde::{Deserialize, Serialize};

use tauri::{
  command,
  State
};

#[derive(Debug, Serialize)]
pub struct AvailableDevice {
    pub label: String, 
    pub id: String
}

#[derive(Default)]
pub struct ActiveConnection<'a> { pub conn: Mutex<Option<Box<dyn Sink<Vec<u8>, Error = SendError> + Unpin + Send + 'a>>> }

#[command]
pub async fn transport_send_data(data: Vec<u8>, state: State<'_, ActiveConnection<'_>>) -> Result<(), ()> {
    let mut lock = state.conn.lock().await;

    let sink = lock.as_mut().unwrap();
    sink.send(data).await;

    Ok(())
}
