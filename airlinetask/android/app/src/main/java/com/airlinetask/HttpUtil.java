package com.airlinetask;

import android.graphics.Bitmap;
import android.util.Base64;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;

public class HttpUtil {

    private static OkHttpClient okHttpClient = new OkHttpClient().newBuilder()
            .connectTimeout( 2000, TimeUnit.SECONDS )
            .readTimeout( 2000, TimeUnit.SECONDS )
            .build();
    public static final MediaType jsonType = MediaType.parse("application/json");

    /**
     * GET请求
     * @param url
     * @return
     * @throws Exception
     */
    public static String runGet(String url)throws Exception{
        Request request = new Request.Builder()
                .addHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
                .url(url)
                .build();

        try{
            return okHttpClient.newCall(request).execute().body().string();
        }catch (Exception e){
            return "fail" + e.getMessage();
        }
    }

    /**
     * POST请求
     * @param url
     * @param data
     * @return
     * @throws Exception
     */
    public static String runPost(String url, String data)throws Exception{
        RequestBody requestBody = RequestBody.create(jsonType, data);
        Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .build();
        try{
            return okHttpClient.newCall(request).execute().body().string();
        }catch (Exception e){
            return "fail" + e.getMessage();
        }
    }

    /**
     * 上传文件
     * @param fileInfo
     * @return
     * @throws Exception
     */
    public static String uploadFiles(String fileInfo, String url)throws Exception{
        // [0]: 文件路径；[1]: 文件类型
        String[] fileInfoArr = fileInfo.split( ";" );
        MultipartBody.Builder requestBody = new MultipartBody.Builder().setType(MultipartBody.FORM);
        File file = new File(fileInfoArr[0]);
        if(file != null){
            // MediaType.parse() 里面是上传的文件类型。
            RequestBody body = RequestBody.create(MediaType.parse(fileInfoArr[1]), file);
            String filename = file.getName();
            // 参数分别为， 请求key ，文件名称 ， RequestBody
            requestBody.addFormDataPart("file", filename, body)
                    .addFormDataPart("type", fileInfoArr[1])
                    .addFormDataPart( "size", fileInfoArr[2] )
                    .addFormDataPart( "userid", fileInfoArr[3])
                    .addFormDataPart( "taskid", fileInfoArr[4] )
                    .addFormDataPart( "jcid", fileInfoArr[5] );
        }

        Request request = new Request.Builder()
                .url(url)
                .post(requestBody.build())
                .build();

        return okHttpClient.newCall(request).execute().body().string();
        /*
        okHttpClient.newBuilder().readTimeout(60000, TimeUnit.MILLISECONDS).build().newCall(request).enqueue( new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {

            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                return response.body().string();

            }
        });

        return "";
        */
    }

    /**
     * bitmap转base64
     * @param bitmap
     * @return
     */
    public static String bitmapToBase64(Bitmap bitmap) {

        String result = null;
        ByteArrayOutputStream baos = null;
        try {
            if (bitmap != null) {
                baos = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);

                baos.flush();
                baos.close();

                byte[] bitmapBytes = baos.toByteArray();
                result = Base64.encodeToString(bitmapBytes, Base64.DEFAULT);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (baos != null) {
                    baos.flush();
                    baos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return result;
    }
}
