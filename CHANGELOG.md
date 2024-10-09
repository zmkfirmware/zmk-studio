# Changelog

## [0.1.0](https://github.com/zmkfirmware/zmk-studio/compare/v0.0.3...v0.1.0) (2024-10-09)


### Features

* Add alert on connect failures, bump deps. ([#47](https://github.com/zmkfirmware/zmk-studio/issues/47)) ([997edc9](https://github.com/zmkfirmware/zmk-studio/commit/997edc97754c3e831175d0c065202c61fcf12a3f))
* Detailed save changes response data. ([#49](https://github.com/zmkfirmware/zmk-studio/issues/49)) ([967aff4](https://github.com/zmkfirmware/zmk-studio/commit/967aff48eee504fe0f1a8b22fc36146536c70368))
* Improved key rendering for HID usages. ([#53](https://github.com/zmkfirmware/zmk-studio/issues/53)) ([14bcaa7](https://github.com/zmkfirmware/zmk-studio/commit/14bcaa79781e53e11af7e9c9d50ae7b7999747d0))


### Bug Fixes

* **app:** Handle manual disconnect for serial transport ([#55](https://github.com/zmkfirmware/zmk-studio/issues/55)) ([3da464f](https://github.com/zmkfirmware/zmk-studio/commit/3da464f892edfe3a459de78b5da862fa938cf3b4))
* Fix Wayland resize/decoration bug. ([#51](https://github.com/zmkfirmware/zmk-studio/issues/51)) ([3ca0679](https://github.com/zmkfirmware/zmk-studio/commit/3ca0679c8238eef02fbfaadd84f712beb2f6735b))

## [0.0.3](https://github.com/zmkfirmware/zmk-studio/compare/v0.0.2...v0.0.3) (2024-10-02)


### Miscellaneous Chores

* Fixes for prod push for releases. ([#45](https://github.com/zmkfirmware/zmk-studio/issues/45)) ([6e05f49](https://github.com/zmkfirmware/zmk-studio/commit/6e05f49b42343c202b0da2bfa8da01bfebe3c550))

## [0.0.2](https://github.com/zmkfirmware/zmk-studio/compare/v0.0.1...v0.0.2) (2024-10-02)


### Miscellaneous Chores

* Bump to Tauri v2 release. ([#42](https://github.com/zmkfirmware/zmk-studio/issues/42)) ([57b3274](https://github.com/zmkfirmware/zmk-studio/commit/57b3274688161a3599f96fba5db1cd671620cf0c))
* Fix release-please automation. ([#43](https://github.com/zmkfirmware/zmk-studio/issues/43)) ([1156c47](https://github.com/zmkfirmware/zmk-studio/commit/1156c47fe3c761e2240128b77f5a72d8dfe17efe))

## 0.0.1 (2024-09-30)


### Features

* Add a few more Consumer overrides. ([2e32100](https://github.com/zmkfirmware/zmk-studio/commit/2e321002843a90d614b7f3b802a44b8cd3a229f5))
* Add a few more HID name overrides. ([30789f6](https://github.com/zmkfirmware/zmk-studio/commit/30789f603b83d8431272c0dac14ceadb1f0105fc))
* Add aboud and license notice modals. ([b9d2692](https://github.com/zmkfirmware/zmk-studio/commit/b9d2692f434740ced2eb40158a2793ec830b6fa7))
* Add disconnect and settings reset UI. ([18b3f22](https://github.com/zmkfirmware/zmk-studio/commit/18b3f22a0bc09223b9bce777da24303b7e276780))
* Add HID label overrides. ([5216e8e](https://github.com/zmkfirmware/zmk-studio/commit/5216e8e9a4557a42e31d499a0453a2462634247d))
* Add HID usage modifier editing. ([14a1578](https://github.com/zmkfirmware/zmk-studio/commit/14a157851569b5940033c8c9031941119d6cdd0b))
* add hover effects to device menu items ([ffd42ee](https://github.com/zmkfirmware/zmk-studio/commit/ffd42eea2eac3ccf5fea92619d236d2932250cb0))
* Add layout rotation support. ([4331681](https://github.com/zmkfirmware/zmk-studio/commit/4331681489e23dd7b7a7cb616876536bb5d2962f))
* Add limits for usages in the list, re-render fixes. ([30f7077](https://github.com/zmkfirmware/zmk-studio/commit/30f707731fe593e6159d15ba1b1316fdf02aa6ea))
* Add names for some keypad key codes ([#34](https://github.com/zmkfirmware/zmk-studio/issues/34)) ([59a6441](https://github.com/zmkfirmware/zmk-studio/commit/59a6441f83ce7857530d62bc666b2652d7706582))
* Add primitive layout picker control. ([e77c09b](https://github.com/zmkfirmware/zmk-studio/commit/e77c09bee86f3baa50f8c8bbfe6c9a1d0628c4b5))
* Add tauri CLI for connecting to serial port. ([86840df](https://github.com/zmkfirmware/zmk-studio/commit/86840dfabb4c743c36a70a4b88f48dbcce9adc92))
* Add UI in connect model when no transports ([9d58e0e](https://github.com/zmkfirmware/zmk-studio/commit/9d58e0e21cbfe0b0781b3b20386bfba1b5b2f068)), closes [#16](https://github.com/zmkfirmware/zmk-studio/issues/16)
* add UI to close about license modals ([01cc93b](https://github.com/zmkfirmware/zmk-studio/commit/01cc93bf630acb71dbb76795da26948ffdb35ed6))
* Add unlock/lock handling. ([6a742e1](https://github.com/zmkfirmware/zmk-studio/commit/6a742e1169c9640619827f097ffb4c76851dea6c))
* Auto-zoom keymap layout ([c98743e](https://github.com/zmkfirmware/zmk-studio/commit/c98743e6a742a568cacf7f908e381956c4299071))
* Basic CI for building apps across platforms. ([2360283](https://github.com/zmkfirmware/zmk-studio/commit/236028364cfc17a75060647cd97f1366285e3214))
* Better detection of proper conn. ([6963c29](https://github.com/zmkfirmware/zmk-studio/commit/6963c299dfbe02fb625b2176ae75bc17adb3127a))
* Better physical layout picker with preview. ([89b38b3](https://github.com/zmkfirmware/zmk-studio/commit/89b38b3ad7e35e7ebddfa962f429e6ba38ff217a))
* Bump client version. ([1b0c8c4](https://github.com/zmkfirmware/zmk-studio/commit/1b0c8c4b9aec2dfbbf4c47e5005c463ac9d8021d))
* Display device name in header. ([d4285a6](https://github.com/zmkfirmware/zmk-studio/commit/d4285a65608e2c283a64133d9d04e3c0e2f3bd22))
* Handle keymap/layout mismatches. ([67bc71a](https://github.com/zmkfirmware/zmk-studio/commit/67bc71abde19679c35297892cce3fe54905cfe77))
* Initial work on skeleton of ZMK Studio UI. ([5a19aa4](https://github.com/zmkfirmware/zmk-studio/commit/5a19aa4a098b76b99954e771120715fc3f50b97c))
* Initial work to reload keymap on layout change. ([fc55232](https://github.com/zmkfirmware/zmk-studio/commit/fc5523214fb99d1dfbef973604361840c590a3f5))
* Layer reordering ([a7bc01d](https://github.com/zmkfirmware/zmk-studio/commit/a7bc01d3ab5321174aafa86c6143f24bb18eaac6))
* More complete disconnect and notif support. ([77062af](https://github.com/zmkfirmware/zmk-studio/commit/77062af5ede8e4e2c28b9e64f5d8206f6f5c1242))
* Move to proper layer IDs. ([44badf1](https://github.com/zmkfirmware/zmk-studio/commit/44badf16fc2eba70b6931919f7f427d781b8fc88))
* Propagate layout selection to the device. ([c2cf65c](https://github.com/zmkfirmware/zmk-studio/commit/c2cf65c35bc3ab36cc57bcddc5842a33f40886eb))
* Properly implement Discard. ([e7a25c0](https://github.com/zmkfirmware/zmk-studio/commit/e7a25c02356d141f988bc9c04d09757c611916c1))
* Release automation using release-please ([f69b015](https://github.com/zmkfirmware/zmk-studio/commit/f69b0151edbc56c95fd0d2e2287e2d8942b2fe79))
* replace edit label prompt with modal ([44acf8c](https://github.com/zmkfirmware/zmk-studio/commit/44acf8c1f5bb8aac8911811fa13cd033be606ba0))
* Show selected key in a physical layout. ([1dc11c8](https://github.com/zmkfirmware/zmk-studio/commit/1dc11c8fb34c8c6fecb8070ed78aea502b078e16))
* Start to incorporate theme colors. ([664d6f3](https://github.com/zmkfirmware/zmk-studio/commit/664d6f3b360e0169cb496871f7e9f87b107a8631))
* Style adjustments ([332d737](https://github.com/zmkfirmware/zmk-studio/commit/332d7374550039a7c6b527ddd10b475f98000d9b))
* Tailwind, prettier, Gorton keys. ([f942781](https://github.com/zmkfirmware/zmk-studio/commit/f942781394954dfad22768929637ac86f36cdcac))
* Ton of layer operations. ([28f2625](https://github.com/zmkfirmware/zmk-studio/commit/28f262557fe457a6eb7d01c1733fb97171a73f27))
* Tons of layout fixes, device selection. ([177f2df](https://github.com/zmkfirmware/zmk-studio/commit/177f2dfe38982c9acba8f08a2737963f460ac1f5))
* Undo/redo, binding updates, save changes. ([47eeb1c](https://github.com/zmkfirmware/zmk-studio/commit/47eeb1caba476868420ca3e0cbf94558e1865a8e))
* Various layout/key render work, theme fixes ([d66d560](https://github.com/zmkfirmware/zmk-studio/commit/d66d560a6c3de41d25502e8f601e63b20cbab38f))
* Windows app/installer signing. ([81a42b5](https://github.com/zmkfirmware/zmk-studio/commit/81a42b5bb91471dfd6a83f5c80cce697097204e2))


### Bug Fixes

* Add `will-change: transform` to force anti-aliasing. ([899c355](https://github.com/zmkfirmware/zmk-studio/commit/899c3556b8ca5c87434912afbd19d109cd26ac7d))
* Add Info.plist for BT access request on macOS. ([2412e70](https://github.com/zmkfirmware/zmk-studio/commit/2412e70ee14f8beeadc3cfe794f913701f0c7be6))
* **app:** Properly load when BT adapter is off. ([3241568](https://github.com/zmkfirmware/zmk-studio/commit/324156873ae69850c319ccedda613635fcc8c342))
* **app:** Workaround for GNOME/Wayland resize bug. ([153a035](https://github.com/zmkfirmware/zmk-studio/commit/153a0355a0a09e0303ed66f845deae7c94801304))
* BT connections on macOS must explicitly connect. ([adf1d01](https://github.com/zmkfirmware/zmk-studio/commit/adf1d01bffaa265215a8c328f8af084431fef58c))
* Build fixes after tweaks. ([679c5ec](https://github.com/zmkfirmware/zmk-studio/commit/679c5ec3c99a2dd203ca2da61245683b8d3a2e38))
* Build gatt transport on macOS. ([1351d5f](https://github.com/zmkfirmware/zmk-studio/commit/1351d5fa34b941e51ef7e132be0e47449a103d4b))
* Bump tauri deps to use custom IPC encoding. ([c6de9de](https://github.com/zmkfirmware/zmk-studio/commit/c6de9de6b0bf4e585f06ccaf39e56e5156e53db8))
* Bump tauri versions, fix CSP ICP issue. ([ba15adc](https://github.com/zmkfirmware/zmk-studio/commit/ba15adc034efe970f2cc263e8f1bf0b8e2987103))
* Bump to client with Windows fixes. ([ad48405](https://github.com/zmkfirmware/zmk-studio/commit/ad48405ce7f83f5ccbc02d29e6535ebd2da5f698))
* Fix up bluest usage for CoreBluetooth. ([0df090b](https://github.com/zmkfirmware/zmk-studio/commit/0df090b34610b2aeaf03f350b1ac5845b8143e72))
* HID override build fix, more overrides. ([8c1633e](https://github.com/zmkfirmware/zmk-studio/commit/8c1633e3bbf68ca647bd76ea45f509343ac9b233))
* Layout fixes. ([eb1d836](https://github.com/zmkfirmware/zmk-studio/commit/eb1d836499e197f0c7e41d431db5922497ec75c9))
* Layout rotation fixes. ([4e53eaf](https://github.com/zmkfirmware/zmk-studio/commit/4e53eaf452e98526f985120c44c68187528c84bc))
* Minor TS fix. ([d377f6c](https://github.com/zmkfirmware/zmk-studio/commit/d377f6c5f5ac6c8fd3c91d613900a56297bea257))
* Modifier selection sizing fixes. ([d966f9d](https://github.com/zmkfirmware/zmk-studio/commit/d966f9d4b90d3686dd38d618a0f1584810468edf))
* Only force connect to devices on macos. ([c199d58](https://github.com/zmkfirmware/zmk-studio/commit/c199d583b77ceef0c4179191881042a370b3a30c))
* Proper 2-param behavior editing. ([b254dac](https://github.com/zmkfirmware/zmk-studio/commit/b254dac0168c763b21d6c002f1eac3c01c9f69fd))
* Proper disconnect/reconnect of BLE. ([635d7b9](https://github.com/zmkfirmware/zmk-studio/commit/635d7b9b195a1cae039022360ec8e7e0b334b3d2))
* Proper logo and title. ([8df6f1e](https://github.com/zmkfirmware/zmk-studio/commit/8df6f1e1791e867e41672bb3b42ef1ad81fe75c4))
* Proper type for device info RPC response. ([7f02898](https://github.com/zmkfirmware/zmk-studio/commit/7f0289829f3a64854d7a44680dc1a8e1ae2c5f92))
* Properly handle USB serial disconnects. ([3d13643](https://github.com/zmkfirmware/zmk-studio/commit/3d13643971ddf218412e7d51591891141156811d))
* Properly include keyboard page modifiers in the picker. ([cfda89e](https://github.com/zmkfirmware/zmk-studio/commit/cfda89e2ced2030dc7d0f72a8d9b3d041f4da697))
* Reopen the connect/lock modals if closed with esc. ([028c1c9](https://github.com/zmkfirmware/zmk-studio/commit/028c1c96f1627238e0d26421184d06c8d4e3ba53))
* Revert attempts at running tauri in container. ([e00bff4](https://github.com/zmkfirmware/zmk-studio/commit/e00bff4311f377b1dfce83d33dbf249a419eaf68))
* Selection state fixes. ([9b41000](https://github.com/zmkfirmware/zmk-studio/commit/9b41000b5e9e559b83d04fd54a3e00dab964ac45))
* Show selection of first key, binding fixes for no-params behaviors. ([32147a9](https://github.com/zmkfirmware/zmk-studio/commit/32147a90e1f2a748fadac0a3f9e22210015a3e06))
* Tweak macOS app signing for testing. ([6d8ef6c](https://github.com/zmkfirmware/zmk-studio/commit/6d8ef6cb69dab87cf8132547a767b3125bd54b24))
* Typo in a vendor name. ([35d0118](https://github.com/zmkfirmware/zmk-studio/commit/35d0118238930b94a8771108b93d008dac91de8e))
* Undo/redo fixes. ([8b25218](https://github.com/zmkfirmware/zmk-studio/commit/8b252185384b41df2d38823e546c891e80227cf7))


### Miscellaneous Chores

* Prepare 0.0.1 release ([1a233de](https://github.com/zmkfirmware/zmk-studio/commit/1a233de12cbe6be3be4e9a3ef766a0b1d9aa3ce1))
