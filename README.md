Requires [Visual C++ Redistributable for Visual Studio 2015](https://www.microsoft.com/en-us/download/details.aspx?id=48145)

NodeJS 14 and up will not work with windows 7. To rebuild this module for Windows 7:
1. Update `node_modules/opencv4nodejs/install/install.js`, set `const nodegypCmd = 'node-gyp rebuild ' + flags` line to `const nodegypCmd = 'node-gyp rebuild ' + flags + ' --target=v13.14.0'` and run that file.
2. Run `node-gyp rebuild --target=v13.14.0` in `node_modules/robotjs`

Using prebuild iohook
1. Goto `node_modules/iohook` and run `set npm_config_targets=node-79&& node install.js`
2. Set `node-v79-win32-x64` in `binding.gyp`
3. Rebuild

Building iohook

1. Clone `github:Luke265/iohook` or `github:wilix-team/iohook`
2. If you dont have cmake-js globally run `npm install` in cloned dir
3. Run `cmake-js rebuild -v 13.14.0` in cloned iohook dir
4. Copy build `iohook.node` and `uiohook.dll` file to dist