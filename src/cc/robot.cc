#include <nan.h>
#include <node.h>
#include <assert.h>
#include <iostream>
#include <opencv2/core.hpp>
#include <core/Mat.h>
#include "time.h"
#include "capture.h"
#include <opencv2/highgui/highgui.hpp>
#include <locale>
#include <codecvt>

std::wstring utf8_to_utf16(const std::string &utf8)
{
  std::vector<unsigned long> unicode;
  size_t i = 0;
  while (i < utf8.size())
  {
    unsigned long uni;
    size_t todo;
    bool error = false;
    unsigned char ch = utf8[i++];
    if (ch <= 0x7F)
    {
      uni = ch;
      todo = 0;
    }
    else if (ch <= 0xBF)
    {
      throw std::logic_error("not a UTF-8 string");
    }
    else if (ch <= 0xDF)
    {
      uni = ch & 0x1F;
      todo = 1;
    }
    else if (ch <= 0xEF)
    {
      uni = ch & 0x0F;
      todo = 2;
    }
    else if (ch <= 0xF7)
    {
      uni = ch & 0x07;
      todo = 3;
    }
    else
    {
      throw std::logic_error("not a UTF-8 string");
    }
    for (size_t j = 0; j < todo; ++j)
    {
      if (i == utf8.size())
        throw std::logic_error("not a UTF-8 string");
      unsigned char ch = utf8[i++];
      if (ch < 0x80 || ch > 0xBF)
        throw std::logic_error("not a UTF-8 string");
      uni <<= 6;
      uni += ch & 0x3F;
    }
    if (uni >= 0xD800 && uni <= 0xDFFF)
      throw std::logic_error("not a UTF-8 string");
    if (uni > 0x10FFFF)
      throw std::logic_error("not a UTF-8 string");
    unicode.push_back(uni);
  }
  std::wstring utf16;
  for (size_t i = 0; i < unicode.size(); ++i)
  {
    unsigned long uni = unicode[i];
    if (uni <= 0xFFFF)
    {
      utf16 += (wchar_t)uni;
    }
    else
    {
      uni -= 0x10000;
      utf16 += (wchar_t)((uni >> 10) + 0xD800);
      utf16 += (wchar_t)((uni & 0x3FF) + 0xDC00);
    }
  }
  return utf16;
}

void getDesktopResolution(const Nan::FunctionCallbackInfo<v8::Value> &info) {
  RECT desktop;
   // Get a handle to the desktop window
   const HWND hDesktop = GetDesktopWindow();
   // Get the size of screen to the variable desktop
   GetWindowRect(hDesktop, &desktop);
   // The top left corner will have coordinates (0,0)
   // and the bottom right corner will have coordinates
   // (horizontal, vertical)
   v8::Local<v8::Array> array = Nan::New<v8::Array>(2);
   Nan::Set(array, 0, Nan::New(desktop.right));
   Nan::Set(array, 1, Nan::New(desktop.bottom));
   info.GetReturnValue().Set(array);
}
void setClip(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
  if (OpenClipboard(NULL))
  {
    HGLOBAL clipbuffer;
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
    v8::String::Utf8Value param1(isolate, info[0]);
    std::string str = std::string(*param1);
    std::wstring source = utf8_to_utf16(str);
    EmptyClipboard();
    int size = (source.size() * 2) + 1;
    clipbuffer = GlobalAlloc(GMEM_DDESHARE, size);
    memcpy((char *)GlobalLock(clipbuffer), source.c_str(), size);
    GlobalUnlock(clipbuffer);
    SetClipboardData(CF_UNICODETEXT, clipbuffer);
    CloseClipboard();
  }
}
void getClip(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
  if (OpenClipboard(NULL) && IsClipboardFormatAvailable(CF_UNICODETEXT))
  {
    v8::Isolate *isolate = info.GetIsolate();
    HANDLE data = GetClipboardData(CF_UNICODETEXT);
    v8::MaybeLocal<v8::String> num = v8::String::NewFromTwoByte(isolate, (uint16_t *)GlobalLock(data));
    GlobalUnlock(data);
    CloseClipboard();
    info.GetReturnValue().Set(num.ToLocalChecked());
  }
}
void find(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
	v8::Isolate* isolate = info.GetIsolate();
	v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
  v8::Local<v8::Object> matHandle = info[0]->ToObject(ctx).ToLocalChecked();
  cv::Mat source = Mat::Converter::unwrapUnchecked(matHandle);
  matHandle = info[1]->ToObject(ctx).ToLocalChecked();
  cv::Mat target = Mat::Converter::unwrapUnchecked(matHandle);
  int pos = 0;
  int tx = 0;
  int ty = 0;
  int x = 0;
  int y = 0;
  uchar sourceB = 0;
  uchar sourceG = 0;
  uchar sourceR = 0;
  uchar targetB = 0;
  uchar targetG = 0;
  uchar targetR = 0;
  int maxDiff = info[2]->ToInt32(ctx).ToLocalChecked()->Value();
  int width = source.cols - target.cols;
  int height = source.rows - target.rows;
  int i = 0;
  bool skip = false;
  for (y = 0; y < height; y++)
  {
    for (x = 0; x < width; x++)
    {
      skip = false;
      for (ty = 0; ty < target.rows; ty++)
      {
        for (tx = 0; tx < target.cols; tx++)
        {
          /*if ((x + tx) > source.cols || (y + ty) > source.cols)
          {
            printf("Out of bounds");
            goto end;
          }*/
          i++;
          pos = ((x + tx) * 3) + ((y + ty) * 3 * source.cols);
          sourceB = source.data[pos];
          sourceG = source.data[pos + 1];
          sourceR = source.data[pos + 2];
          pos = (tx * 3) + (ty * 3 * target.cols);
          targetB = target.data[pos];
          targetG = target.data[pos + 1];
          targetR = target.data[pos + 2];
          if (
              std::abs(sourceB - targetB) > maxDiff ||
              std::abs(sourceG - targetG) > maxDiff ||
              std::abs(sourceR - targetR) > maxDiff)
          {
            skip = true;
            break;
          }
        }
        if (skip)
        {
          break;
        }
      }
      if (tx == target.cols && ty == target.rows)
      {
        v8::Local<v8::Array> a = Nan::New<v8::Array>(2);
        Nan::Set(a, 0, Nan::New(x));
        Nan::Set(a, 1, Nan::New(y));
        info.GetReturnValue().Set(a);
        printf("Iterations: %u\n", i);
        return;
      }
    end:
      continue;
    }
  }
}
/*
void screenMat(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
  if (info.Length() < 1)
  {
    Nan::ThrowTypeError("Wrong number of arguments");
    return;
  }

  v8::Local<v8::Object> matHandle = info[0]->ToObject();
  v8::Isolate *isolate = info.GetIsolate();
  Mat *matObj = Nan::ObjectWrap::Unwrap<Mat>(matHandle);
  cv::Mat mat = matObj->mat;
  HWND hWnd = NULL;
  int x = 0;
  int y = 0;

  if (info.Length() > 2)
  {
    if (!info[1]->IsNumber() || !info[2]->IsNumber())
    {
      Nan::ThrowTypeError("Wrong arguments");
      return;
    }
    int x = info[1]->Int32Value();
    int y = info[2]->Int32Value();

    if (info.Length() > 3 && info[3]->IsString())
    {
      // cv::Mat mat = FF_UNWRAP_MAT_AND_GET(matHandle);
      v8::String::Utf8Value param1(info[5]->ToString());
      std::string title = std::string(*param1);
      // std::wstring stemp = std::wstring(title.begin(), title.end());
      std::cout << title << std::endl;
      // cv::Mat* mat = (cv::Mat*) ptr.operator();

      LPCSTR sw = title.c_str();
      hWnd = ::FindWindow(0, sw);
    }
  }
  // hwnd2mat(hWnd, mat.data, mat.cols, mat.rows, x, y, 3);
  robot::WinCapture capture;
  Sleep(100);
  uint64 start = GetTimeMs64();
  capture.grab(&mat);

  std::cout << "Capture: " << GetTimeMs64() - start << std::endl;
  cv::namedWindow("Display window", cv::WINDOW_AUTOSIZE); // Create a window for display.
                                                          //cv::Mat m(1080, 1920, CV_8UC4, resource.pData);
  cv::imshow("Display window", mat);
  cv::waitKey(0);

  //v8::Local<v8::Number> num = Nan::New(0);
  //info.GetReturnValue().Set(num);
}*/

void Init(v8::Local<v8::Object> exports)
{
  Capture::Init(exports);
  v8::Isolate* isolate = exports->GetIsolate();
  v8::Local<v8::Context> ctx = isolate->GetCurrentContext();
 /* v8::String::NewFromOneByte(isolate, "find").ToLocalChecked();
  Nan::Set(
	  exports,
	  Nan::New("find").ToLocalChecked(),
       Nan::New<v8::FunctionTemplate>(find)->GetFunction(ctx).ToLocalChecked()
  );
  exports->Set(Nan::New("getClip").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(getClip)->GetFunction());
  exports->Set(Nan::New("setClip").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(setClip)->GetFunction());
  exports->Set(Nan::New("getDesktopResolution").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(getDesktopResolution)->GetFunction());*/
  //Nan::Set(exports, Nan::New<v8::String>("find").ToLocalChecked(), ctor->GetFunction(find).ToLocalChecked());
//Nan::Set(exports, Nan::New<v8::String>("getClip").ToLocalChecked(), ctor->GetFunction(getClip).ToLocalChecked());
//Nan::Set(exports, Nan::New<v8::String>("setClip").ToLocalChecked(), ctor->GetFunction(setClip).ToLocalChecked());
//Nan::Set(exports, Nan::New<v8::String>("getDesktopResolution").ToLocalChecked(), ctor->GetFunction(getDesktopResolution).ToLocalChecked());

  exports->Set(ctx, Nan::New<v8::String>("find").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(find)->GetFunction(ctx).ToLocalChecked());
  exports->Set(ctx, Nan::New<v8::String>("getClip").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(getClip)->GetFunction(ctx).ToLocalChecked());
  exports->Set(ctx, Nan::New<v8::String>("setClip").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(setClip)->GetFunction(ctx).ToLocalChecked());
  exports->Set(ctx, Nan::New<v8::String>("getDesktopResolution").ToLocalChecked(), Nan::New<v8::FunctionTemplate>(getDesktopResolution)->GetFunction(ctx).ToLocalChecked());
}

NODE_MODULE_INIT() {
	Init(exports);
}
/*
napi_value Method(napi_env env, napi_callback_info info) {
  napi_status status;
  napi_value world;
  status = napi_create_string_utf8(env, "world as", 8, &world);
  assert(status == napi_ok);
  return world;
}

napi_value capture(napi_env env, napi_callback_info info) {
  cv::Mat* mat = (cv::Mat*)NULL;

	std::string s = env->GetStringUTFChars(title, 0);
	std::wstring stemp = std::wstring(s.begin(), s.end());
	LPCWSTR sw = stemp.c_str();

	HWND hWnd = ::FindWindow(0, sw);

	PrintWindow(hWnd, GetDC(hWnd), 0);

	hwnd2mat(hWnd, mat->data, width, height, x, y, 3);

  napi_status status;
  napi_value world;
  status = napi_create_string_utf8(env, "world as", 8, &world);
  assert(status == napi_ok);
  return world;
}

#define DECLARE_NAPI_METHOD(name, func)                          \
  { name, 0, func, 0, 0, 0, napi_default, 0 }

void dump_buffer() {

}

napi_value Init(napi_env env, napi_value exports) {
  std::cout << "test" << std::endl;
  hwnd2mat();
  dump_buffer();
  napi_status status;
  napi_property_descriptor desc = DECLARE_NAPI_METHOD("hello", Method);
  status = napi_define_properties(env, exports, 1, &desc);
  assert(status == napi_ok);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)*/
//ports;
// }*/

//NAPI_MODULE(NODE_GYP_MODULE_NAME, Init))*/