package com.airlinetask;

import android.os.Environment;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;

public class SoraModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext reactContex;

    public void Toast(String message) {
        Toast.makeText(getReactApplicationContext(), message,Toast.LENGTH_LONG).show();
    }

    public  SoraModule(ReactApplicationContext reactContext){
        super(reactContext);
        this.reactContex = reactContext;
    }

    @Override
    public String getName() {
        return "SoraExample";
    }
    @ReactMethod
    public void show(String message, int duration) {
        Toast.makeText(getReactApplicationContext(), message,Toast.LENGTH_LONG).show();
    }

    @ReactMethod
    public  void saveData (String userId,String taskId,String fileName, String content, Callback succesCallBack, Callback errorCallBack) {
        //获取外部存储卡的可用状态
        String storageState = Environment.getExternalStorageState();
        if(storageState.equals(Environment.MEDIA_MOUNTED)) {
            File fileDirectory = new File(this.reactContex.getExternalCacheDir().getAbsolutePath() + File.separator + userId + File.separator + taskId);
            if(fileDirectory.exists() && fileDirectory.isDirectory()){

            }else {
                fileDirectory.mkdirs();
            }
            String filename = reactContex.getExternalCacheDir().getAbsolutePath()+File.separator + userId + File.separator + taskId + File.separator + fileName;
//            String filename = reactContex.getExternalCacheDir().getAbsolutePath() + File.separator + "test.txt";
            File targetFile = new File(filename);

            FileOutputStream outputStream = null;
            try {
                if(!targetFile.exists()){
                    targetFile.createNewFile();
                }
                outputStream = new FileOutputStream(filename);
                outputStream.write(content.getBytes("utf-8"));
                outputStream.close();
                succesCallBack.invoke("success");
            } catch (FileNotFoundException e) {
                errorCallBack.invoke("fail:FileNotFoundException");
                this.Toast("File not found");
//                e.printStackTrace();
            } catch (UnsupportedEncodingException e) {
                errorCallBack.invoke("fail:UnsupportedEncodingException");
                this.Toast("Unsupported encode");
//                e.printStackTrace();
            } catch (IOException e) {
                errorCallBack.invoke("fail:IOException");
                this.Toast("IO Exception");
//                e.printStackTrace();
            }
        }else {
            errorCallBack.invoke("fail:无法访问外部存储");
        }
    }
    @ReactMethod
    public  void getData (String userId, String taskId, String fileName , Callback succesCallBack, Callback errorCallBack) {
        //获取外部存储卡的可用状态
        String storageState = Environment.getExternalStorageState();
        StringBuilder sb = new StringBuilder();
        if(storageState.equals(Environment.MEDIA_MOUNTED)) {
            // 拼接出文件的绝对路径
            String filename = reactContex.getExternalCacheDir().getAbsolutePath()+File.separator + userId + File.separator + taskId + File.separator + fileName;
            File targetFile = new File(filename);
            //
            if(targetFile.exists()){
                try {
                    FileInputStream input = new FileInputStream(targetFile);
                    byte[] buffer = new byte[1024];
                    int len = input.read(buffer);
                    while(len > 0) {
                        sb.append(new String(buffer,0,len,"utf-8"));
                        len = input.read(buffer);
                    }
                    succesCallBack.invoke(sb.toString());
                    input.close();
                } catch (FileNotFoundException e) {
                    errorCallBack.invoke("fail:FileNotFoundException");
//                    e.printStackTrace();
                } catch (IOException e) {
                    errorCallBack.invoke("fail:IOException");
//                    e.printStackTrace();
                }
//                this.Toast(sb.toString());
            }else {
                errorCallBack.invoke("fail:不存在该文件");
            }

        }else {
            this.Toast("【错误】无法访问外部存储空间");
            errorCallBack.invoke("fail:无法访问外部存储");
        }
    }
    @ReactMethod
    public  void getBatchedData (String userId, String taskId, String fileNameList  , Callback succesCallBack, Callback errorCallBack) {
        //获取外部存储卡的可用状态
        String storageState = Environment.getExternalStorageState();
        StringBuilder sb = new StringBuilder();
        if(storageState.equals(Environment.MEDIA_MOUNTED)) {
            String[] list = fileNameList.split(",");
            WritableArray array = Arguments.createArray();
            if(list.length>0){
                for(int i =0; i<list.length;i++) {
                    // 清空sb内容
                    sb.delete( 0, sb.length() );
                    // 拼接出文件的绝对路径
                    String filename = reactContex.getExternalCacheDir().getAbsolutePath() + File.separator + userId + File.separator + taskId + File.separator + list[i];
                    File targetFile = new File(filename);
                    //
                    if (targetFile.exists()) {
                        try {
                            FileInputStream input = new FileInputStream(targetFile);
                            byte[] buffer = new byte[1024];
                            int len = input.read(buffer);
                            while (len > 0) {
                                sb.append(new String(buffer, 0, len, "utf-8"));
                                len = input.read(buffer);
                            }
//                            succesCallBack.invoke(sb.toString());
                            array.pushString(sb.toString());
                            input.close();
                        } catch (FileNotFoundException e) {
                            // errorCallBack.invoke("fail:FileNotFoundException");
//                            array.pushString("");
//                    e.printStackTrace();
                        } catch (IOException e) {
                            // errorCallBack.invoke("fail:IOException");
//                            array.pushString("");
//                    e.printStackTrace();
                        }
//                        this.Toast(sb.toString());
                    } else {
                        // errorCallBack.invoke("fail:不存在该文件");
//                        array.pushString("");
                    }
                }
                succesCallBack.invoke(array);
            }else {
                errorCallBack.invoke("fail:文件名有误");
            }



        }else {
            this.Toast("【错误】无法访问外部存储空间");
            errorCallBack.invoke("fail:无法访问外部存储");
        }
    }

    @ReactMethod
    public  void getBatchedDataByKey (String key, Callback succesCallBack, Callback errorCallBack) {
        //获取外部存储卡的可用状态
        String storageState = Environment.getExternalStorageState();
        StringBuilder sb = new StringBuilder();
        if(storageState.equals(Environment.MEDIA_MOUNTED)) {
            WritableArray array = Arguments.createArray();
            String filename = reactContex.getExternalCacheDir().getAbsolutePath() + File.separator + key;
            // 拼接出文件的绝对路径
            File targetFile = new File(filename);
            if (targetFile.isDirectory()) {
                File[] files = targetFile.listFiles();
                for(File file:files){
                    if(file.isDirectory()){
                        continue;
                    }
                    try {
                        FileInputStream input = new FileInputStream(file);
                        byte[] buffer = new byte[1024];
                        int len = input.read(buffer);
                        while (len > 0) {
                            sb.append(new String(buffer, 0, len, "utf-8"));
                            len = input.read(buffer);
                        }
//                            succesCallBack.invoke(sb.toString());
                        array.pushString(sb.toString());
                        input.close();
                    } catch (FileNotFoundException e) {
                        // errorCallBack.invoke("fail:FileNotFoundException");
//                        array.pushString("");
                    } catch (IOException e) {
                        // errorCallBack.invoke("fail:IOException");
//                        array.pushString("");
//                    e.printStackTrace();
                    }
//                    this.Toast(sb.toString());
                }
                succesCallBack.invoke(array);

            } else {
                // errorCallBack.invoke("fail:不存在该文件")
//                array.pushString("");
                succesCallBack.invoke(array);
            }

        }else {
            this.Toast("【错误】无法访问外部存储空间");
            errorCallBack.invoke("fail:无法访问外部存储");
        }
    }

    @ReactMethod
    public  void removeDirectory (String key, Callback succesCallBack, Callback errorCallBack) {
        //获取外部存储卡的可用状态
        String storageState = Environment.getExternalStorageState();
        if(storageState.equals(Environment.MEDIA_MOUNTED)) {
            // 拼接出文件的绝对路径
            String filename = reactContex.getExternalCacheDir().getAbsolutePath() + File.separator + key;
            try{
                deleteDirectory(new File(filename));
                succesCallBack.invoke(true);
            }catch (Exception e){
                errorCallBack.invoke("fail:"+e.getMessage());
            }



        }else {
            this.Toast("【错误】无法访问外部存储空间");
            errorCallBack.invoke("fail:无法访问外部存储");
        }
    }

    public void deleteDirectory(File dir){
        if(dir.isDirectory()){
            File[] sub = dir.listFiles();
            for(File file:sub){
                if(file.isDirectory()){
                    deleteDirectory(file);
                }else{
                    file.delete();
                }
            }
        }else {
            dir.delete();
        }


    }



    @ReactMethod
    public void test(String userId,String taskId,String content) {
        File fileDir = getReactApplicationContext().getFilesDir().getAbsoluteFile();
        File destFile = new File(fileDir,"staticHtmlcopy.html");
        InputStream is = null;
        try {
            is = getReactApplicationContext().getAssets().open("staticHtml.html");
            if(destFile.exists()){
                destFile.delete();
            }
            FileOutputStream out = new FileOutputStream(destFile);
            try {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) >=0) {
                    out.write(buffer,0,bytesRead);
                }
            } finally {
                out.flush();
                try {
                    out.getFD().sync();
                } catch (IOException e) {

                }
                out.close();
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        String url = "file://"+destFile.getAbsolutePath();
        Toast.makeText(getReactApplicationContext(),url,Toast.LENGTH_LONG).show();
    }

    /**
     * 发送事件、数据到RN
     * @param eventName
     * @param eventData
     */
    private void emitEvent(String eventName, String eventData){
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }
}



