{
  "targets": [
    {
      "target_name": "robot",
      "sources": [ 
				"./src/cc/robot.cc", 
				"./src/cc/capture/win_capture.h", 
				"./src/cc/capture/win7_capture.h", 
				"./src/cc/capture/win8_capture.h", 
				"./src/cc/capture/capture.h", 
				"./src/cc/capture.cc"
				],
      "include_dirs": [
        "<!@(node lib/utils/find-opencv.js --cflags)",
        "./node_modules/opencv4nodejs/cc",
        "./node_modules/opencv4nodejs/cc/core",
        "./node_modules/opencv4nodejs/cc/modules",
        "<!(node -e \"require('nan')\")",
		"<!(node -e \"require('native-node-utils')\")",
      ],
      "libraries": [
        "<!@(node lib/utils/find-opencv.js --libs)"
      ],
		"cflags" : [
			"-std=c++11"
		],
		"cflags!" : [
			"-fno-exceptions"
		],
		"cflags_cc!": [
			"-fno-rtti",
			"-fno-exceptions"
		],
		"ldflags" : [
			"-Wl,-rpath,'$$ORIGIN'"
		],
		"xcode_settings": {
			"OTHER_CFLAGS": [
				"-std=c++11",
				"-stdlib=libc++"
			],
			"GCC_ENABLE_CPP_EXCEPTIONS": "YES"
		},
		"conditions": [
			[ "OS==\"win\"", {
				"cflags": [
					"-Wall"
				],
				"defines": [
					"WIN",
					"_HAS_EXCEPTIONS=1"
				],
				"msvs_settings": {
					"VCCLCompilerTool": {
						"ExceptionHandling": "2",
						"RuntimeLibrary": "2"
					},
				}
			}],
	        ["OS==\"mac\"",
	          {
	            "link_settings": {
	              "libraries": [
					"-Wl,-rpath,@loader_path/../../../opencv-build/opencv/build/lib"
	              ],
	            }
	          }
	        ]
		]
    },
		{
			"target_name": "postbuild",
			"type": "none",
			"dependencies": ["robot"],
			"copies": [
				{
					"files": [
						"<(PRODUCT_DIR)/robot.node",
						"node_modules/opencv4nodejs/build/Release/opencv4nodejs.node",
						"node_modules/iohook/builds/node-v79-win32-x64/build/Release/iohook.node",
						"node_modules/iohook/builds/node-v79-win32-x64/build/Release/uiohook.dll",
						"node_modules/robotjs/build/Release/robotjs.node"
					],
					"destination": "./dist"
				}
			]
		}
  ]
}