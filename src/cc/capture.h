#include <opencv2/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include "NativeNodeUtils.h"
#include "capture/win_capture.h"
#include "capture/win7_capture.h"
#include "capture/win8_capture.h"

#ifndef Capture_W_H
#define Capture_W_H
class Capture : public Nan::ObjectWrap
{
  public:
    robot::Capture *capture;

    static Nan::Persistent<v8::FunctionTemplate> constructor;
/*
    robot::Capture *getNativeObjectPtr() { return capture; }
    robot::Capture getNativeObject() { 
        std::cout << "Getting native" << std::endl;
        return *capture;
        }

    typedef InstanceConverter<Capture, robot::Capture> Converter;*/

    static NAN_MODULE_INIT(Init);
    static NAN_METHOD(New);
    static NAN_METHOD(grab);

    static const char *getClassName()
    {
        return "Capture";
    }
};

#endif