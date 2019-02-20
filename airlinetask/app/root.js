import React from 'react'
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation'
import HomeContainer from './containers/HomeContainer'
import JcContainer from './containers/JcContainer'
import ManualContainer from './containers/ManualContainer'
import test from './containers/test'

const MainScreenNavigator = createBottomTabNavigator (
    {
        Home: {
            screen: HomeContainer
        },
        Test: {
            screen: test
        }
    },{
        tabBarPosition: 'bottom',
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
            style: {
                height:49
            },
            activeBackgroundColor:'white',
            activeTintColor:'#4ECBFC',
            inactiveBackgroundColor:'white',
            inactiveTintColor:'#aaa',
            showLabel: true,
        }
    }
)

const Root = createStackNavigator (
    {
        main: {
            screen: HomeContainer
        },
        jc: {
            screen: JcContainer
        },
        manual: {
            screen: ManualContainer
        }
    }/**,
    {
        headerMode: 'screen',
        navigationOptions: {
            header: null,
            headerStyle: {
                backgroundColor: global.gColor.themeColor,
            },
            headerTitleStyle: {
                color: global.gColor.backgroundColor,
                fontSize: 20
            },
            headerTintColor: global.gColor.backgroundColor,
        }
    }*/
)

export default Root