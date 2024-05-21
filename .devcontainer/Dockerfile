from fedora:41

RUN dnf update -y 

RUN dnf group list
RUN dnf install -y @c-development @development-tools

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

RUN dnf install -y \
  nodejs \
  webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  libgudev-devel
