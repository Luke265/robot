#include "screenshot.h"

void hwnd2mat(HWND hwnd, byte *data, int width, int height, int x, int y, int channels)
{

	HDC hwindowDC, hwindowCompatibleDC;

	HBITMAP hbwindow;
	BITMAPINFOHEADER bi;

	hwindowDC = GetDC(hwnd);
	hwindowCompatibleDC = CreateCompatibleDC(hwindowDC);
	//SetStretchBltMode(hwindowCompatibleDC, COLORONCOLOR);

	//src.create(height, width, CV_8UC4);
	// create a bitmap
	hbwindow = CreateCompatibleBitmap(hwindowDC, width, height);
	bi.biSize = sizeof(BITMAPINFOHEADER); //http://msdn.microsoft.com/en-us/library/windows/window/dd183402%28v=vs.85%29.aspx
	bi.biWidth = width;
	bi.biHeight = -height; //this is the line that makes it draw upside down or not
	bi.biPlanes = 1;
	bi.biBitCount = 8 * channels;
	bi.biCompression = BI_RGB;

	//hbwindow = CreateDIBSection(hwindowDC, (BITMAPINFO *)&bi, DIB_RGB_COLORS, (void**) data, GetHandle(), FileHeader()->bfOffBits);
	// use the previously created device context with the bitmap
	SelectObject(hwindowCompatibleDC, hbwindow);
	// uint64 start = GetTimeMs64();
	// copy from the window device context to the bitmap device context
	BitBlt(hwindowCompatibleDC, 0, 0, width, height, hwindowDC, x, y, CAPTUREBLT | SRCCOPY);
		// std::cout << "Capture: " << GetTimeMs64() - start << std::endl;
	//StretchBlt(hwindowCompatibleDC, 0, 0, width, height, hwindowDC, x, y, width, height, CAPTUREBLT | SRCCOPY); //change SRCCOPY to NOTSRCCOPY for wacky colors !
	//GetDIBits(hwindowCompatibleDC, hbwindow, 0, 0, NULL, (BITMAPINFO *)&bi, DIB_RGB_COLORS);  //copy from hwindowCompatibleDC to hbwindow
	GetDIBits(hwindowCompatibleDC, hbwindow, 0, height, data, (BITMAPINFO *)&bi, DIB_RGB_COLORS); //copy from hwindowCompatibleDC to hbwindow
	//printf("%d ", bi.biSizeImage);
	//fflush(stdout);
	/*for (int i = 0; i < height * width; i++) {
		byte b = &data[i];
		printf(*data[i]);
		fflush(stdout);
	}*/
	DeleteObject(hbwindow);
	DeleteDC(hwindowCompatibleDC);
	ReleaseDC(hwnd, hwindowDC);
}