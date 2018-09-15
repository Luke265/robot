#pragma once
#include <opencv2/core.hpp>
namespace robot
{
class Capture;
};
class robot::Capture
{
public:
  virtual bool grab(cv::Mat* mat, int block) = false;
  virtual void init() = NULL;
};