package com.airlinetask;

import android.graphics.Color;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.net.URLDecoder;
import java.util.ArrayList;

import cn.org.bjca.anysign.android.api.Interface.OnSealSignResultListener;
import cn.org.bjca.anysign.android.api.core.SealSignAPI;
import cn.org.bjca.anysign.android.api.core.SealSignObj;
import cn.org.bjca.anysign.android.api.core.SignatureAPI;
import cn.org.bjca.anysign.android.api.core.Signer;
import cn.org.bjca.anysign.android.api.core.domain.AnySignBuild;
import cn.org.bjca.anysign.android.api.core.domain.SealSignResult;
import cn.org.bjca.anysign.android.api.core.domain.SignatureType;

public class MainActivity extends ReactActivity {

    private static MainActivity mainActivity;
    private String url;
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "airlinetask";
    }

    public MainActivity() {
        mainActivity = this;
    }

    public static MainActivity getMainActivity() {
        return mainActivity;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    private SealSignAPI api = null;
    private int apiResult;
    private ReactContext reactContext = null;
    private String userInfo = null;
    private String userId = "";

    // 单签加密包
    private Object obj = null;
    // 批签加密包
    private ArrayList listRequest = null;

    /**
     * 签名API初始化
     * @param reactContext
     * @param userInfo
     */
    public void initApi(ReactContext reactContext, String userInfo){
        if(this.reactContext == null){
            this.reactContext = reactContext;
        }
        if(this.userInfo == null){
            this.userInfo = userInfo;
        }
        String[] infoArr = null;
        if(userInfo == null){
            return;
        }else{
            infoArr = userInfo.split(":");
            this.userId = infoArr[0];
        }
        try{
            // 设置签名算法，默认为RSA，可以设置成SM2
            AnySignBuild.Default_Cert_EncAlg = "SM2";
            // 初始化API
            if(api == null){
                api = new SealSignAPI(this);
            }

            // 设置渠道号
            apiResult = api.setChannel("999999");
            // 渠道设置结果
            Log.e("XSS", "apiResult -- setChannel：" + apiResult);

            final String sealData = "原文初始化";
            apiResult = api.setOrigialContent(sealData.getBytes("UTF-8"));

            Signer signer = new Signer(infoArr[1], infoArr[0], Signer.SignerCardType.TYPE_IDENTITY_CARD);
            // Signer signer = new Signer("aaa", "bbb", Signer.SignerCardType.TYPE_IDENTITY_CARD);
            SealSignObj obj = new SealSignObj(0,signer);
            MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "sealData 是:" + sealData);
            MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "siner 是:" + "aaa" + "bbb" + Signer.SignerCardType.TYPE_IDENTITY_CARD);
            obj.Signer = signer;
            //	设置签名规则
            //obj.SignRule = signRule;
            //	设置签名图片高度，单位dip
            obj.single_height = 100;
            //	设置签名图片宽度，单位dip
            obj.single_width = 100;
            //	设置签名对话框的高度，单位dip
            obj.single_dialog_height = 500;
            //	设置签名对话框的宽度，单位dip
            obj.single_dialog_width = 600;
            obj.IsTSS = true;
            obj.nessesary = true;
            obj.penColor = Color.BLACK;

            apiResult = api.addSignatureObj(obj, SignatureType.SIGN_TYPE_SIGN);
            Log.e("XSS", "apiResult -- addSignatureObj：" + apiResult);

            /*
             * 注册签名结果回调函数
             */
            api.setSealSignResultListener(new OnSealSignResultListener() {


                @Override
                public void onSignResult(SealSignResult signResult)
                {
                    // 检查是否已经准备好签名
                    int readyCode = api.isReadyToGen();
                    if(readyCode != 0){
                        Toast.makeText(MainActivity.getMainActivity().reactContext,"错误代码:" + readyCode,Toast.LENGTH_LONG).show();
                        return;
                    }
                    // final String base64Code = HttpUtil.bitmapToBase64(signResult.signature);
                    final String base64Code = HttpUtil.bitmapToBase64(signResult.signature).replaceAll("\r|\n", "");;


                    // 生成签名信息
                    // MainActivity.this.listRequest.clear();
                    MainActivity.this.listRequest = api.genSignRequest( MainActivity.this.signDataList );
                    // 发送加密包
                    new Thread( new Runnable() {
                        @Override
                        public void run() {
                            try{
                                JSONObject jsonObject = new JSONObject();
                                if(MainActivity.this.isSingle){
                                    jsonObject.put("signdata", MainActivity.this.listRequest.get( 0 ).toString());
                                }else{
                                    String[] signIdArr = MainActivity.this.signId.split( "," );
                                    String signData = "";
                                    for(String signId:signIdArr){
                                        for(int i=0;i<MainActivity.this.signDataList.size();i++){
                                            String tempData = new String((byte[]) MainActivity.this.signDataList.get( i ));
                                            if(tempData.contains( signId+"-textInfo:" )){
                                                if(signData.equals( "" )){
                                                    signData = signId + ":" + MainActivity.this.listRequest.get( i ).toString();
                                                }else {
                                                    signData = signData + "-split-" + signId + ":" + MainActivity.this.listRequest.get( i ).toString();
                                                }

                                            }
                                        }
                                    }
                                    jsonObject.put( "signdata",signData );
                                }
                                jsonObject.put("jcid", MainActivity.this.jcId);
                                jsonObject.put( "base64", base64Code );
                                jsonObject.put("posid",MainActivity.this.posId);
                                jsonObject.put("signid", MainActivity.this.signId);
                                jsonObject.put("signtype", MainActivity.this.signType);

                                if(MainActivity.this.userId == null){
                                    MainActivity.getMainActivity().emitEvent("ErrorToRNMessage", "");
                                    Looper.prepare();
                                    Toast.makeText(MainActivity.getMainActivity().getApplicationContext(),"签名失败",Toast.LENGTH_LONG).show();
                                    Looper.loop();
                                }else{
                                    jsonObject.put("userid", MainActivity.this.userId);
                                }
                                //String result = HttpUtil.runPost("http://192.168.0.146:8080/xmis/AirlineTaskAction/signJcData.do", jsonObject.toString());
                                if(null != MainActivity.this.offlinejcdata){
                                    MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "签名完成，当前为离线模式");
                                    // 离线模式
                                    if(MainActivity.this.isSingle){
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessageOffline", jsonObject.toString());
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", jsonObject.toString());
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessage", base64Code);
                                    }else {
                                        JSONObject json = new JSONObject();
                                        String[] signIdArr = MainActivity.this.signId.split( "," );
                                        String[] posIdArr = MainActivity.this.posId.split( "," );
                                        StringBuffer sb = new StringBuffer();
                                        for(int i =0;i<signIdArr.length;i++){
                                            json.put("signdata", MainActivity.this.listRequest.get( i ).toString());
                                            json.put("jcid", MainActivity.this.jcId);
                                            json.put( "base64", base64Code );
                                            json.put("posid",posIdArr[i]);
                                            json.put("signid", signIdArr[i]);
                                            json.put("signtype", MainActivity.this.signType);
                                            json.put("userid", MainActivity.this.userId);
                                            if(i==0){
                                                sb.append(json.toString());
                                            }else{
                                                sb.append("-split-");
                                                sb.append(json.toString());
                                            }
                                        }
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "lalala"+sb.toString());
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessageOffline", sb.toString());
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessage", base64Code);
//                                        for(String str:signIdArr){
//                                            json.put("signdata", MainActivity.this.listRequest.get( 0 ).toString());
//                                        }
                                    }
                                    
                                }else {
                                    MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "签名完成，当前为在线模式");
                                    MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", jsonObject.toString());
                                    String result = HttpUtil.runPost(url + "/xmis/AirlineTaskAction/signJcData.do", jsonObject.toString());
                                    JSONObject jsonObjectResult = new JSONObject(result);
                                    if(jsonObjectResult.get( "result" ).equals( "success" )){
                                        // 签名成功，返回签名图片
                                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessage", base64Code);
                                    }else{
                                        MainActivity.getMainActivity().emitEvent("ErrorToRNMessage", "");
                                        Looper.prepare();
                                        Toast.makeText(MainActivity.getMainActivity().getApplicationContext(),"签名失败：" +  jsonObjectResult.get( "info" ),Toast.LENGTH_LONG).show();
                                        Looper.loop();
                                    }
                                    Log.e("tagtag", result);
                                }
                                // 清空离线jcdata，防止下次签名误判
                                MainActivity.this.offlinejcdata = null;
                                
                            }catch (Exception e){
                                MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", e.getMessage());
                                Log.e("tagtag", e.getMessage());
                            }
                        }
                    } ).start();
                    // 重置签名API
                    // MainActivity.getMainActivity().api.resetAPI();
                }

                @Override
                public void onDismiss(int index, SignatureType signType)
                {
                    // Log.e("XSS", "onDismiss index : " + index + "  signType : " + signType);
                    MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "onDismiss index : " + index + "  signType : " + signType);
                }

                @Override
                public void onCancel(int index, SignatureType signType)
                {
                    // 重置签名API
                    MainActivity.getMainActivity().emitEvent("ErrorToRNMessage", "");
                }
            });

        }catch (Exception e){
            e.printStackTrace();
            Log.e("Exception:", e.getMessage());
        }
    }

    /**
     * 发送事件、数据到RN
     * @param eventName
     * @param eventData
     */
    private void emitEvent(String eventName, String eventData){
        this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }

    private String jcId = null;
    private String posId = null;
    private String signId = null;
    private String signType = "pos";
    private Boolean isSingle = true;
    private ArrayList signDataList=new ArrayList<>(  );
    private String offlinejcdata = null;
    /**
     * 弹出签名框
     */
    public void show(String signData){
        if(signData == null) {
            Toast.makeText(this.reactContext,"获取工卡数据失败！",Toast.LENGTH_LONG).show();
            return;
        }else{
            String[] dataArr = signData.split(":");
            // this.jcId = dataArr[0];
            if(dataArr[0].equals( "jcid" )){       //完工签署
                this.signType="jc";
                this.jcId = dataArr[1];
                this.isSingle = true;
            }else if(dataArr[0].equals("date")){   //日期签署
                this.signType="date";
                this.jcId = dataArr[1];
            }else if(dataArr[0].equals("posid")){  //工序签署
                // Toast.makeText(this.reactContext,"工序签署！",Toast.LENGTH_LONG).show();
                this.signType="pos";
                this.jcId = dataArr[1];
                this.posId = dataArr[2];
                this.signId = dataArr[3];
                // 此处为离线版本才会传入的值 传入事先存储的jcdata
                if(dataArr.length==5){
                    // hint 提示用户当前为离线签署
                    Toast.makeText(this.reactContext,"离线签署！",Toast.LENGTH_LONG).show();
                    // 将jcdata存入成员变量 方便签名时使用
                    this.offlinejcdata = dataArr[4];
                    // 给RN发log信息，用于调试
                    MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", this.offlinejcdata);
                }

                if (dataArr[3].contains( "," )){
                    this.isSingle = false;        // 批量签署
                }else{
                    this.isSingle = true;         // 单个签署
                }
            }
            //另开一个线程，获取加密数据
            new Thread( new Runnable() {
                @Override
                public void run() {
                    try{
                        // log 线程运行
                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "线程运行");
                        if(!MainActivity.this.signType.equals( "date" )) {
                            String result = "";
                            // 若offlinejcdata不为null 说明为离线签名
                            if(null!=MainActivity.this.offlinejcdata){
                                // log 进入 离线签名 分支
                                MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "离线签名");
                                // 模拟成正常请求时返回的json数据
                                result = "{\"result\":\"success\",\"jcdata\":"+MainActivity.this.offlinejcdata+"}";
                                // log 打印出拼出字符串是否正确
                                MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", result);
                            }else{
                                // 正常的请求jcdata流程
                                result = HttpUtil.runGet(url + "/xmis/AirlineTaskAction/getJcData.do?signtype=" + MainActivity.this.signType + "&jcid="+MainActivity.this.jcId+"&posid="+MainActivity.this.posId+"&signid="+MainActivity.this.signId+"&userid="+MainActivity.this.userId);
                            }
                            MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "获取加密数据结束");
                            //String result = HttpUtil.runGet( "http://192.168.0.146:8080/xmis/AirlineTaskAction/getJcData.do?signtype=" + MainActivity.this.signType + "&jcid=" + MainActivity.this.jcId + "&posid=" + MainActivity.this.posId + "&signid=" + MainActivity.this.signId + "&userid=" + MainActivity.this.userId );
                            JSONObject jsonObject = new JSONObject( result );
                            // 请求成功分支
                            if (jsonObject.getString( "result" ).equals( "success" )) {
                                // log 正常运行
                                MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", "加密成功运行");
                                // 清除可能存在的上次残留数据
                                MainActivity.this.signDataList.clear();
                                // 接收过来的jcdata 带有很多%20  进行urldecode
                                String jcData = URLDecoder.decode( jsonObject.getString( "jcdata" ), "UTF-8" );
                                if(MainActivity.this.isSingle) { // 单签
                                    MainActivity.this.signDataList.add( jcData.getBytes( "UTF-8" ) );
                                }else{                           // 批签
                                    String[] signDataArr=jcData.split( "-split-" );
                                    for(String signData:signDataArr){
                                        MainActivity.this.signDataList.add( signData.getBytes( "UTF-8" ) );
                                    }
                                }
                                // MainActivity.this.initApi( MainActivity.this.reactContext, MainActivity.this.userInfo );
                                if (api != null) {
                                    try {
                                        apiResult = api.showSignatureDialog( 0 );
                                        if (apiResult == SignatureAPI.SUCCESS) {
                                            Log.e( "result：", "成功" );
                                        } else {
                                            Log.e( "error-code：", apiResult + "" );
                                        }
                                    } catch (Exception e) {
                                        Log.e( "show-exception:", e.getMessage() );
                                    }
                                }
                            } else {
                                MainActivity.getMainActivity().emitEvent("ErrorToRNMessage", "");
                                Looper.prepare();
                                Toast.makeText( MainActivity.getMainActivity().getApplicationContext(), "签名失败：" + jsonObject.get( "info" ), Toast.LENGTH_LONG ).show();
                                Looper.loop();
                            }
                        }else {
                            api.setOrigialContent( "date".getBytes("UTF-8") );
                            api.showSignatureDialog( 0 );

                        }
                    }catch (Exception e){
                        // Toast.makeText(MainActivity.getMainActivity().getApplicationContext(), "出错啦",Toast.LENGTH_LONG).show();
                        MainActivity.getMainActivity().emitEvent("AndroidToRNMessageLog", e.getMessage());
                        Log.e("tagtag", e.getMessage());
                    }
                }
            } ).start();
        }

    }

    @Override
    public void finish(){
        if(api != null){
            api.finalizeAPI();
        }
        super.finish();
    }

}
