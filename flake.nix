{
  description = "zmk-studio devshell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            rustc
            cargo
            rustfmt
            clippy
            pkg-config
            openssl
            udev
          ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [
            glib
            gtk3
            webkitgtk_4_1
            libsoup_3
            cairo
            pango
            gdk-pixbuf
            atk
            harfbuzz
            dconf
            glib-networking
            librsvg
            gsettings-desktop-schemas
          ] ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [
            darwin.apple_sdk.frameworks.WebKit
            darwin.apple_sdk.frameworks.Cocoa
            darwin.apple_sdk.frameworks.AppKit
            darwin.apple_sdk.frameworks.Security
            darwin.apple_sdk.frameworks.SystemConfiguration
          ];

          shellHook = ''
            export PATH=$(echo "$PATH" | tr ':' '\n' | grep -v "$HOME/.cargo/bin" | paste -sd ':')

            export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig:${pkgs.udev.dev}/lib/pkgconfig:${pkgs.dbus.dev}/lib/pkgconfig:$PKG_CONFIG_PATH"

            # WebKitGTK needs these to render CSS correctly on NixOS
            export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}''${XDG_DATA_DIRS:+:$XDG_DATA_DIRS}"
            export GIO_EXTRA_MODULES="${pkgs.dconf.lib}/lib/gio/modules:${pkgs.glib-networking}/lib/gio/modules"
            export GDK_PIXBUF_MODULE_FILE="${pkgs.librsvg}/lib/gdk-pixbuf-2.0/2.10.0/loaders.cache"

            echo "devshell loaded"
            node -v
            npm -v
          '';
        };
      });
}

