import {
    Dimensions,
    Platform
} from 'react-native'

global.gScreen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    navBarHeight: Platform.OS === 'ios' ? 64 : 50,
}

global.gColor = {
    themeColor: '#35495e',
    backgroundColor: '#ffffff',
    border: '#d5d5d5',
}