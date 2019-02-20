import axios from 'axios'

const service = axios.create({
    baseURL: 'http://wechattest.ameco.com.cn:8089',
    // baseURL: 'http://220.194.29.215:8080',
    timeout: 300000
})

service.interceptors.request.use(config => {
    return config
}, error => {
    console.log(error)
    return Promise.reject(error)
})

service.interceptors.response.use(
    response => {
        return response
    },
    error => {
        console.log(error)
        return Promise.reject(error)
    }
)

export default service