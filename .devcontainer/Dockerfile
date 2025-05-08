from fedora:41

RUN dnf update -y

RUN dnf group list
RUN dnf install -y @c-development @development-tools
RUN dnf check-update
RUN dnf install -y \
  nodejs \
  webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  lld llvm \
  mingw64-nsis \
  clang-cl

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"
# RUN dnf install -y mingw64-gcc mingw64-crt mingw64-winpthreads mingw64-headers
# RUN wget https://github.com/tauri-apps/binary-releases/releases/download/nsis-3/nsis-3.zip
# RUN unzip nsis-3.zip
# RUN ls -la nsis-3.08
# RUN cp nsis-3.08/Stubs/* /usr/share/nsis/Stubs/
# RUN cp -r nsis-3.08/Plugins/** /usr/share/nsis/Plugins/

RUN rustup target add x86_64-pc-windows-msvc

RUN cargo install --locked cargo-xwin