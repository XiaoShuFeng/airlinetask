package com.airlinetask;

import android.widget.Toast;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONObject;

public class AnySignModule extends ReactContextBaseJavaModule {

    private ReactContext reactContext = null;
    private String url = null;

    public AnySignModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        this.reactContext = reactApplicationContext;
    }

    @Override
    public String getName() {
        return "AnySignModule";
    }

    /**
     * 初始化电签API
     * @param infoStr
     */
    @ReactMethod
    public void initApi(String infoStr){
        MainActivity.getMainActivity().initApi(reactContext, infoStr);
    }

    /**
     * 要签名的数据
     * @param signData
     */
    @ReactMethod
    public void show(String signData) {
        MainActivity.getMainActivity().show(signData);
    }

    /**
     * 共享URL
     * @param url
     */
    @ReactMethod
    public void setUrl(String url){
        this.url = url;
        MainActivity.getMainActivity().setUrl(url);
    }

    /**
     * 原生提示
     * @param msg
     */
    @ReactMethod
    public void showToast(String msg){
        Toast.makeText(reactContext,msg,Toast.LENGTH_LONG).show();
    }

    /**
     * 上传文件
     * @param fileInfo
     */
    @ReactMethod
    public void upLoadFile(String fileInfo) {
        try{
            String result = HttpUtil.uploadFiles( fileInfo, this.url + "/xmis/AirlineTaskAction/upLoadJcFile.do");
            JSONObject jsonObjectResult = new JSONObject(result);
            if(jsonObjectResult.getString( "result" ).equals( "success" )){
                Toast.makeText(reactContext,"上传成功",Toast.LENGTH_LONG).show();
            }else{
                Toast.makeText(reactContext,jsonObjectResult.getString( "info" ),Toast.LENGTH_LONG).show();
            }
        }catch (Exception e){
            Toast.makeText(reactContext,"上传失败：" + e.getMessage(),Toast.LENGTH_LONG).show();
        }

    }
}
