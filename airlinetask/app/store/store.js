import { createStore, applyMiddleware, combineReducers } from 'redux'
import createLogger from 'redux-logger'
import login from '../reducers/login'
import createSagaMiddleware, {END} from 'redux-saga'

const initState = {
    login: login.initState
}

const reducers = {
    login: login.loginReducer
}

const sagaMiddleware = createSagaMiddleware()

const middleware = []

middleware.push(sagaMiddleware)

if(__DEV__) {
    middleware.push(createLogger)
}

const rootReducers = combineReducers(reducers)

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore)

export default function configureStore() {
    const store = createStoreWithMiddleware(rootReducers, initState)
    store.runSaga = sagaMiddleware.run
    store.close = () => store.dispatch(END)
    return store
}