#include "capture.h"
#include <Mat.h>
#include <VersionHelpers.h>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/core.hpp>

Nan::Persistent<v8::FunctionTemplate> Capture::constructor;

NAN_MODULE_INIT(Capture::Init)
{
    v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(Capture::New);
    Capture::constructor.Reset(ctor);
    ctor->InstanceTemplate()->SetInternalFieldCount(1);
    ctor->SetClassName(Nan::New("Capture").ToLocalChecked());
    Nan::SetPrototypeMethod(ctor, "grab", grab);

    target->Set(Nan::New("Capture").ToLocalChecked(), ctor->GetFunction());
};

NAN_METHOD(Capture::New)
{
    Capture *self = new Capture();
    if (false && IsWindows8OrGreater())
    {
        self->capture = new robot::Win8Capture();
    }
    else
    {
        self->capture = new robot::Win7Capture();
    }
    self->capture->init();
    self->Wrap(info.Holder());
    FF_RETURN(info.Holder());
}

NAN_METHOD(Capture::grab)
{
    FF_METHOD_CONTEXT("Capture::grab");
    cv::Mat *mat = &FF_UNWRAP_MAT_AND_GET(info[0]->ToObject());
    robot::Capture* capture = Nan::ObjectWrap::Unwrap<Capture>(info.This())->capture;
    FF_ARG_INT_IFDEF(1, int block, 0);
    capture->grab(mat, block);
    FF_RETURN(true);
}
