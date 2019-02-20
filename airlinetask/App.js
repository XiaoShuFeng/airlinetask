/**
 * Airline Task React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react'
import { Provider } from 'react-redux'
import configureStore from './app/store/store'
import Root from './app/root'

const store = configureStore()

const App = () => (
    <Provider store={store}>
      <Root/>
    </Provider>
)

export default App
