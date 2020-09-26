#pragma once
#include <windows.h>
#include <shlobj.h>
#include <shellapi.h>
#include <dxgi1_2.h>
#include <d3d11.h>
#include <memory>
#include <algorithm>
#include <string>
#include <stdio.h>
#include <iostream>
#include "win_capture.h"
#include "CComPtrCustom.h"
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/core.hpp>
#include <opencv2/imgproc/types_c.h>
#pragma comment(lib, "D3D11.lib")

namespace robot
{
class Win8Capture;
};
class robot::Win8Capture : public robot::Capture
{
	CComPtrCustom<ID3D11Device> lDevice;
	CComPtrCustom<ID3D11DeviceContext> lImmediateContext;
	CComPtrCustom<IDXGIOutputDuplication> lDeskDupl;
	CComPtrCustom<ID3D11Texture2D> lAcquiredDesktopImage;
	CComPtrCustom<ID3D11Texture2D> lGDIImage;
	CComPtrCustom<ID3D11Texture2D> lDestImage;
	CComPtrCustom<IDXGIResource> lDesktopResource;
	DXGI_OUTPUT_DESC lOutputDesc;
	DXGI_OUTDUPL_FRAME_INFO lFrameInfo;
	DXGI_OUTDUPL_DESC lOutputDuplDesc;
	D3D11_MAPPED_SUBRESOURCE resource;
	D3D11_TEXTURE2D_DESC desc;
	cv::Mat *baseMat = NULL;

  public:
	bool grab(cv::Mat *mat, int block)
	{
		if (baseMat == NULL || baseMat->rows != mat->rows || baseMat->cols != mat->cols)
		{
			if (baseMat != NULL) {
				baseMat->release();
			}
			baseMat = new cv::Mat(mat->rows, mat->cols, CV_8UC4);
		}
		HRESULT hr(E_FAIL);
		hr = lDeskDupl->AcquireNextFrame(
			block > 15 ? block : 15,
			&lFrameInfo,
			&lDesktopResource);
		if (SUCCEEDED(hr))
		{
			hr = lDesktopResource->QueryInterface(IID_PPV_ARGS(&lAcquiredDesktopImage));
			lDesktopResource.Release();
			if (FAILED(hr))
				return false;

			if (lAcquiredDesktopImage == nullptr)
				return false;

			hr = lDevice->CreateTexture2D(&desc, NULL, &lDestImage);

			if (FAILED(hr))
				return false;

			if (lDestImage == nullptr)
				return false;
			lImmediateContext->CopyResource(lDestImage, lAcquiredDesktopImage);
			lAcquiredDesktopImage.Release();
			// Copy from CPU access texture to bitmap buffer

			UINT subresource = D3D11CalcSubresource(0, 0, 0);
			D3D11_TEXTURE2D_DESC *des = new D3D11_TEXTURE2D_DESC;
			D3D11_MAPPED_SUBRESOURCE *pRes = new D3D11_MAPPED_SUBRESOURCE;
			lDestImage->GetDesc(des);
			lImmediateContext->Map(lDestImage, subresource, D3D11_MAP_READ_WRITE, 0, pRes);
			lDestImage.Release();
			lDeskDupl->ReleaseFrame();
			if (pRes->pData != NULL)
			{
				baseMat->data = reinterpret_cast<uchar *>(pRes->pData);
				cv::cvtColor(*baseMat, *mat, CV_RGBA2RGB);
			}
		}
		else if (hr == DXGI_ERROR_WAIT_TIMEOUT)
		{
			// ignore
			if (baseMat != NULL)
			{
				cv::cvtColor(*baseMat, *mat, CV_RGBA2RGB);
			}
			return false;
			//if(resource.pData == NULL) {
			//}
		}
		else if (hr != DXGI_ERROR_WAIT_TIMEOUT && FAILED(hr))
		{
			std::cout << "failed" << std::endl;
			return false;
		}
		return true;
	}
	void init()
	{
		static D3D_DRIVER_TYPE gDriverTypes[] =
			{
				D3D_DRIVER_TYPE_HARDWARE};
		static UINT gNumDriverTypes = ARRAYSIZE(gDriverTypes);

		// Feature levels supported
		static D3D_FEATURE_LEVEL gFeatureLevels[] =
			{
				D3D_FEATURE_LEVEL_11_0,
				D3D_FEATURE_LEVEL_10_1,
				D3D_FEATURE_LEVEL_10_0,
				D3D_FEATURE_LEVEL_9_1};

		static UINT gNumFeatureLevels = ARRAYSIZE(gFeatureLevels);

		D3D_FEATURE_LEVEL lFeatureLevel;

		HRESULT hr(E_FAIL);

		// Create device
		for (UINT DriverTypeIndex = 0; DriverTypeIndex < gNumDriverTypes; ++DriverTypeIndex)
		{
			hr = D3D11CreateDevice(
				nullptr,
				gDriverTypes[DriverTypeIndex],
				nullptr,
				0,
				gFeatureLevels,
				gNumFeatureLevels,
				D3D11_SDK_VERSION,
				&lDevice,
				&lFeatureLevel,
				&lImmediateContext);

			if (SUCCEEDED(hr))
			{
				// Device creation success, no need to loop anymore
				break;
			}

			lDevice.Release();

			lImmediateContext.Release();
		}
		if (FAILED(hr))
			return;

		Sleep(100);

		if (lDevice == nullptr)
			return;

		// Get DXGI device
		CComPtrCustom<IDXGIDevice> lDxgiDevice;

		hr = lDevice->QueryInterface(IID_PPV_ARGS(&lDxgiDevice));

		if (FAILED(hr))
			return;

		// Get DXGI adapter
		CComPtrCustom<IDXGIAdapter> lDxgiAdapter;
		hr = lDxgiDevice->GetParent(
			__uuidof(IDXGIAdapter),
			reinterpret_cast<void **>(&lDxgiAdapter));

		if (FAILED(hr))
			return;

		lDxgiDevice.Release();

		// display num
		UINT Output = 0;

		// Get output
		CComPtrCustom<IDXGIOutput> lDxgiOutput;
		hr = lDxgiAdapter->EnumOutputs(
			Output,
			&lDxgiOutput);

		if (FAILED(hr))
			return;

		lDxgiAdapter.Release();

		hr = lDxgiOutput->GetDesc(
			&lOutputDesc);

		if (FAILED(hr))
			return;

		// QI for Output 1
		CComPtrCustom<IDXGIOutput1> lDxgiOutput1;

		hr = lDxgiOutput->QueryInterface(IID_PPV_ARGS(&lDxgiOutput1));

		if (FAILED(hr))
			return;

		lDxgiOutput.Release();

		// Create desktop duplication
		hr = lDxgiOutput1->DuplicateOutput(
			lDevice,
			&lDeskDupl);

		if (FAILED(hr))
			return;
		lDxgiOutput1.Release();

		// Create GUI drawing texture
		lDeskDupl->GetDesc(&lOutputDuplDesc);

		desc.Width = lOutputDuplDesc.ModeDesc.Width;

		desc.Height = lOutputDuplDesc.ModeDesc.Height;

		desc.Format = lOutputDuplDesc.ModeDesc.Format;

		desc.ArraySize = 1;

		desc.BindFlags = D3D11_BIND_FLAG::D3D11_BIND_RENDER_TARGET;

		desc.MiscFlags = D3D11_RESOURCE_MISC_GDI_COMPATIBLE;

		desc.SampleDesc.Count = 1;

		desc.SampleDesc.Quality = 0;

		desc.MipLevels = 1;

		desc.CPUAccessFlags = 0;

		desc.Usage = D3D11_USAGE_DEFAULT;

		hr = lDevice->CreateTexture2D(&desc, NULL, &lGDIImage);

		if (FAILED(hr))
			return;

		if (lGDIImage == nullptr)
			return;

		// Create CPU access texture

		desc.Width = lOutputDuplDesc.ModeDesc.Width;

		desc.Height = lOutputDuplDesc.ModeDesc.Height;

		desc.Format = lOutputDuplDesc.ModeDesc.Format;

		desc.ArraySize = 1;

		desc.BindFlags = 0;

		desc.MiscFlags = 0;

		desc.SampleDesc.Count = 1;

		desc.SampleDesc.Quality = 0;

		desc.MipLevels = 1;

		desc.CPUAccessFlags = D3D11_CPU_ACCESS_READ | D3D11_CPU_ACCESS_WRITE;
		desc.Usage = D3D11_USAGE_STAGING;

		Sleep(100);
	}
};