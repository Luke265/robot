#include "capture.h"
#include <Mat.h>
#include <VersionHelpers.h>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/core.hpp>
#include "capture\CAPTURE.H"

Nan::Persistent<v8::FunctionTemplate> Capture::constructor;

NAN_MODULE_INIT(Capture::Init)
{
    v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(Capture::New);
	v8::Local<v8::Context> ctx = Nan::GetCurrentContext();
    Capture::constructor.Reset(ctor);
    ctor->InstanceTemplate()->SetInternalFieldCount(1);
    ctor->SetClassName(Nan::New("Capture").ToLocalChecked());
    Nan::SetPrototypeMethod(ctor, "grab", grab);
	Nan::Set(target, Nan::New<v8::String>("Capture").ToLocalChecked(), ctor->GetFunction(ctx).ToLocalChecked());
};

NAN_METHOD(Capture::New)
{
    Capture *self = new Capture();
    if (IsWindows8OrGreater())
    {
        self->capture = new robot::Win8Capture();
    }
    else
    {
        self->capture = new robot::Win7Capture();
    }
    self->capture->init();
    self->Wrap(info.Holder());
	info.GetReturnValue().Set(info.Holder());
}

NAN_METHOD(Capture::grab)
{
	v8::Local<v8::Context> ctx = Nan::GetCurrentContext();
	cv::Mat mat = Mat::Converter::unwrapUnchecked(info[0]->ToObject(ctx).ToLocalChecked());
    robot::Capture* capture = Nan::ObjectWrap::Unwrap<Capture>(info.This())->capture;
	int block = 0;
	if (info.Length() > 1 && info[1]->IsInt32()) {
		block = info[1]->ToInt32(ctx).ToLocalChecked()->Value();
	}
    capture->grab(&mat, block);
	info.GetReturnValue().Set(true);
}
