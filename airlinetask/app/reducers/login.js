const initState = {
    login: false,
    userName: ''
}

const loginReducer = (state = initState, action) => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
            return {
                ...state,
                login: true,
                userName: action.payload.username,
            }
        default:
            return state
    }
}

export default { initState, loginReducer }