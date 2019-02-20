import React from 'react'
import {
    View,
    StyleSheet,
    WebView
} from 'react-native'

class ManualContainer extends React.Component{
    static navigationOptions = ({navigation}) => ({
        headerTitle: '手册查询',
        headerStyle: {
            backgroundColor: global.gColor.themeColor
        },
        headerTitleStyle: {
            color: global.gColor.backgroundColor,
            fontSize: 20
        },
        headerTintColor: global.gColor.backgroundColor
    })
    constructor(props){
        super(props)
    }
    componentDidMount(){
        this.refs.webViewRef.reload()
    }
    render() {
        return(
            <View style={styles.container}>
                <WebView
                    ref="webViewRef"
                    style={styles.base}
                    source={{uri: 'http://production1.ameco.com.cn:7084/NewAmecoPortal/'}}
                    javaScriptEnabled
                    startInLoadingState
                    scalesPageToFit
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    base: {
        width: '100%',
        height: '100%'
    }
})

export default ManualContainer