//
//  AnySignModuleIos.m
//  airlinetask
//
//  Created by wangtianmac on 2018/9/6.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "AnySignModuleIos.h"

@implementation AnySignModuleIos
//将当前对象暴露给ReactNative 可以访问
RCT_EXPORT_MODULE();

// 必须要实现该方法,才能调用RN
- (NSArray<NSString *> *)supportedEvents
{
  return @[@"AndroidToRNMessage"];
}

//对React Native提供调用方法,Callback
RCT_EXPORT_METHOD(testCallbackEvent:(NSString *)event callback:(RCTResponseSenderBlock)callback)
{
  NSLog(@"%@",event);
  NSString *callbackData = @"Callback数据"; //准备回调回去的数据
  callback(@[[NSNull null],callbackData]);
}

//对React Native提供调用方法
RCT_EXPORT_METHOD(initApi:(NSString *)event)
{
  NSLog(@"%@",event);
  
  [self sendEventWithName:@"AndroidToRNMessage" body:@"base64"];
}

RCT_EXPORT_METHOD(show:(NSString *)event)
{
  NSLog(@"%@",event);
  // Objective-C 传递数据给RN
  [self sendEventWithName:@"AndroidToRNMessage" body:@"传送到RN的数据，签名图片的base64码"];
}
@end
