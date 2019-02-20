/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Button,
    NativeModules
} from 'react-native';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {

    onButtonPress1 = () => {
        NativeModules.XyNativeModule.show(500) //无回调
    }
    onButtonPress2 = () => {
        NativeModules.XyNativeModule.testAndroidCallbackMethod("hello",(obj)=>{
            console.log(obj);
            alert(obj)
        }); // 有回调
    }
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome} >
                    Welcome to React Native!
                </Text>
                <Text style={styles.instructions}>
                    To get started, edit App.js
                </Text>
                <Text style={styles.instructions}>
                    {instructions}
                </Text>
                <Button
                    onPress={this.onButtonPress1}
                    title="无回调"
                />
                <Button
                    onPress={this.onButtonPress2}
                    title="有回调"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    base: {
        width: '100%',
        height: '100%'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
