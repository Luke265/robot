#pragma once
#include "win_capture.h"
#include <windows.h>

namespace robot {
class Win7Capture;
};
class robot::Win7Capture: public robot::Capture
{

public:
  bool grab(cv::Mat* mat, int block) {
    HDC hwindowDC, hwindowCompatibleDC;

	HWND hwnd = NULL;
	HBITMAP hbwindow;
	BITMAPINFOHEADER bi;

	hwindowDC = GetDC(hwnd);
	hwindowCompatibleDC = CreateCompatibleDC(hwindowDC);
	// create a bitmap
	int width = mat->cols;
	int height = mat->rows;
	hbwindow = CreateCompatibleBitmap(hwindowDC, width, height);
	bi.biSize = sizeof(BITMAPINFOHEADER); //http://msdn.microsoft.com/en-us/library/windows/window/dd183402%28v=vs.85%29.aspx
	bi.biWidth = width;
	bi.biHeight = -height; //this is the line that makes it draw upside down or not
	bi.biPlanes = 1;
	bi.biBitCount = 8 * 3;
	bi.biCompression = BI_RGB;

	//hbwindow = CreateDIBSection(hwindowDC, (BITMAPINFO *)&bi, DIB_RGB_COLORS, (void**) data, GetHandle(), FileHeader()->bfOffBits);
	// use the previously created device context with the bitmap
	SelectObject(hwindowCompatibleDC, hbwindow);
	// copy from the window device context to the bitmap device context
	BitBlt(hwindowCompatibleDC, 0, 0, width, height, hwindowDC, 0, 0, CAPTUREBLT | SRCCOPY);
	GetDIBits(hwindowCompatibleDC, hbwindow, 0, height, mat->data, (BITMAPINFO *)&bi, DIB_RGB_COLORS); //copy from hwindowCompatibleDC to hbwindow
	DeleteObject(hbwindow);
	DeleteDC(hwindowCompatibleDC);
	ReleaseDC(hwnd, hwindowDC);
	return true;
  }
  void init() {
  }
};