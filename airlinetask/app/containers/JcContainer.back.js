import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import axios from 'axios'

import {
    View,
    StyleSheet,
    NativeModules,
    Platform,
    DeviceEventEmitter,
    WebView,
    NetInfo } from 'react-native'
import storage from '../components/storage'
import SoraModule from '../components/SoraModule'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
class JcContainer extends React.Component {
    static navigationOptions = ({navigation}) => ({
        headerTitle: '工卡预览',
        headerStyle: {
            backgroundColor: global.gColor.themeColor,
        },
        headerTitleStyle: {
            color: global.gColor.backgroundColor,
            fontSize: 20
        },
        headerTintColor: global.gColor.backgroundColor,
        headerRight: (
            <Icon.Button
                onPress={() => {
                    navigation.state.params.refresh()
                }}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.8}
                name="md-refresh"
            />
        ),
    })
    constructor(props) {
        super(props)
        this.state = {
            userId: '',
            userName: '',
            jcId: '',
            taskState: '',
            taskId: '',
            url: '',
            avatarSource: '',
            posId: '',
            signId: '',
            location: '',
            signType: 'pos',
            online: false

        }
    }

    _saveData =(key,id,data,msg)=> {
        console.log("\n")
        storage.save({
            key: key,
            id: id,
            data: data,
            //expires为有效时间
            expires: null
        })
        console.log('key:'+key+'  id:'+id+'   msg:'+msg);
        console.log(data)
        console.log('save end ---------------')
        console.log("\n")
    }

    _saveDataFile =(key,id,data,msg)=> {
        console.log("\n")
        console.log("---- save start..")
        console.log(typeof(data))
        // console.log(data)
        // console.log('key:'+key+'  id:'+id+ ' msg:'+msg || '');
        console.log('key:'+key+'  id:'+id+ ' msg:'+msg || '');
        
        key = key.replace(/:/g,"/")
        SoraModule.saveData(key,"",id,data,(success)=>{
    
        },(err)=>{
    
        })
        
        // console.log(data)
        console.log('save end ---------------')
        // console.log("\n")
    }

    _loadData = (key,id,callback,fail)=>{
        console.log("load")
        console.log('key:'+key+'  id:'+id)
        storage.load({
            key: key,
            id: id,
            autoSync: false,
            syncInBackground: true,
        }).then(ret => {
            console.log(ret);
            if(typeof(callback) === 'function'){
                callback(ret);
            }
            
        }).catch(err => {
            console.warn(err.message);
            if(typeof(fail) === 'function'){
                fail(err);
            }
        })
        console.log('load end ----')
    }

    _loadDataFile = (key,id,callback,fail)=>{
        console.log("load")
        console.log('key:'+key+'  id:'+id)
        key = key.replace(/:/g,"/")
        SoraModule.getData(key,"",id,(data)=>{
            console.log(data);
            if(typeof(callback) === 'function'){
                callback(data);
            }
        },(err)=>{
            console.warn(err.message)
            if(typeof(fail) === 'function'){
                fail(err);
            }
        })
        console.log('load end ----')
    }

    refreshJc = () => {
        // this.refs.main.showMenu()
        // alert('menu')
        this.refs.webViewRef.reload()       // 重新加载页面
    }

    deleteSign = (delType, signId, location) => {
        // axios.get(this.state.url + '/xmis/AirlineTaskAction/delSignData.do', {
        axios.get( this.state.url + '/xmis/AirlineTaskAction/delSignData.do', {
        //axios.get('http://192.168.0.146:8080/xmis/AirlineTaskAction/delSignData.do', {
            params:{
                jcid: this.state.jcId,
                posid: this.state.posId,
                signid: signId,
                userid: this.state.userId,
                signtype: delType
            }
        }).then(response => {
            if(response.data.result === 'success') {
                if (delType === 'deljcsign') {
                    this.refs.webViewRef.postMessage('deleteesign:jcid')
                } else if (delType === 'deldatesign') {   // 已废除
                    this.refs.webViewRef.postMessage('deleteesign:date')
                } else if (delType === 'delpossign') {
                    this.refs.webViewRef.postMessage('deleteesign:' + signId + ':' + location)
                }
            }else{
                if (delType === 'deljcsign') {
                    this.refs.webViewRef.postMessage('error:jcid')
                } else if (delType === 'delpossign') {
                    this.refs.webViewRef.postMessage('error:' + location)
                }
                NativeModules.AnySignModule.showToast('删除电签失败！')
            }
        })
    }

    esignOperation = (val) => {
        console.log('눈_눈_눈 '+val)
        let that = this
        let dataArr = val.split(':')
        if (dataArr[0] === 'esign' || dataArr[0] === 'modifyesign') {
            // 电签或修改签署
            // dataArr[1]:签署ID；dataArr[2]:工序ID
            if(dataArr[1] === 'jcid'){
                this.setState({signType: 'jc'}, () => {
                    if(Platform.OS === 'android'){
                        //NativeModules.AnySignModule.initApi(this.state.userId + ':' + this.state.userName + ':' + this.state.jcId) // 电签初始化
                        NativeModules.AnySignModule.show('jcid:'+dataArr[2])
                    }else{

                    }
                })
            }else if(dataArr[1] === 'date'){
                this.setState({signType: 'date'}, () => {
                    NativeModules.AnySignModule.show('date:'+dataArr[2])
                })
            }else{
                
                this.setState({
                    signType: 'pos',  
                    posId: dataArr[1],
                    signId: dataArr[2],
                    location: dataArr[3]
                },() => {
                    if(Platform.OS === 'android'){
                            // 离线模式
                        if(!this.state.online){
                            console.log('离线模式')
                            // console.log('posid')
                            // console.log(dataArr[1])
                            // console.log('signid')
                            // console.log(dataArr[2])
                            // console.log('location')
                            // console.log(dataArr[3])
                            let posArr = dataArr[1].split(',')
                            let signidArr = dataArr[2].split(',')
                            let locationArr = dataArr[3].split(',')
                            let ids = []
                            for(let i=0;i<posArr.length;i++){
                                ids.push('jcdata-'+this.state.jcId+'-'+posArr[i]+'-'+signidArr[i])
                            }
                            storage.getBatchDataWithIds({
                                key:this.state.userId + ':' + that.state.taskId,
                                ids:ids
                            }).then(ret=>{
                                let jcdataArr = []
                                for(let i =0;i<ret.length;i++){
                                    jcdataArr.push(ret[i].jcdata)
                                }
                                console.log('show')
                                console.log('posid:'+ this.state.jcId + ':' + dataArr[1] + ':' + dataArr[2] + ':'+jcdataArr.join('-split-'))
                                NativeModules.AnySignModule.show('posid:'+ this.state.jcId + ':' + dataArr[1] + ':' + dataArr[2] + ':'+jcdataArr.join('-split-')) // posid+jcid+posid+signid+jcdata
                            }).catch(err=>{
                                alert('获取jcdata失败，请重新离线')
                            })
                            // this._loadData(this.state.userId,'jcdata:'+this.state.jcId + ':' +dataArr[1] + ':' +dataArr[2],(ret) =>{
                            
                            // NativeModules.AnySignModule.show('posid:'+ this.state.jcId + ':' + dataArr[1] + ':' + dataArr[2] + ':'+ret.jcdata) // posid+jcid+posid+signid+jcdata
                            // },(err) =>{
    
                            // })
                        }else{
                            // 在线模式
                            console.log('在线模式')
                            NativeModules.AnySignModule.show('posid:'+ this.state.jcId + ':' + dataArr[1] + ':' + dataArr[2]) // posid+jcid+posid+signid
                        }
                        
                        
                    }else{

                    }
                })
            }
        }else if(dataArr[0] === 'deleteesign'){
            //删除签署
            let type = ''
            let signId = ''
            let location = ''
            if(dataArr[1] === 'jcid'){
                type = 'deljcsign'
            }else if(dataArr[1] === 'date'){
                type = 'deldatesign'
            }else{
                type = 'delpossign'
                signId = dataArr[2]
                location = dataArr[3]
            }
            this.deleteSign(type, signId, location)
        }else if(dataArr[0] === 'offlinedeleteesign'){
            //删除离线签署
            let type = ''
            let signId = ''
            let location = ''
            if(dataArr[1] === 'jcid'){
                type = 'deljcsign'
            }else if(dataArr[1] === 'date'){
                type = 'deldatesign'
            }else{
                type = 'delpossign'
                signId = dataArr[2]
                location = dataArr[3]
                that._loadData(this.state.userId + ':' + that.state.taskId,'jcpossign-'+this.state.jcId+'-'+location,(ret)=>{
                    console.log('删除已有签名 ')
                    ret.base64 = undefined
                    that._saveData(this.state.userId + ':' + that.state.taskId,'jcpossign-'+this.state.jcId+'-'+location,ret)
                    // 删除请求post内容
                    storage.remove({
                        key: this.state.userId+'offlinepost',
                        id: 'offlinepost'+that.state.jcId+location
                    });
                    this.refs.webViewRef.postMessage('deleteesign:' + signId + ':' + location)
                },(err)=>{
                    console.log('这个?不存在')
                })
            }
            //this.deleteSignOffline(type, signId, location)
        }else if(dataArr[0] === 'offlinejcpage') {
            //离线版 拉取页面数据
            let userid = dataArr[1]
            let jcid = dataArr[2]
            this._loadDataFile(userid+':'+that.state.taskId,'jcpage'+jcid,(ret)=>{
                console.log('--------------拉取到离线的页面')
                console.log(ret)
                this.refs.webViewRef.postMessage('jcpage:'+ret)
            },(err)=>{
                console.log('-------------拉取离线页面失败')
                console.log(err)
            })

        }else if(dataArr[0] === 'offlinejcinfo') {
            //离线版 拉取页面jcinfo
            let userid = dataArr[1]
            let jcid = dataArr[2]
            this._loadData(userid + ':' +that.state.taskId,'jcinfo'+jcid,(ret)=>{
                console.log('--------------拉取到离线的jcinfo')
                console.log(ret)
                this.refs.webViewRef.postMessage('offlinejcinforesponse:'+JSON.stringify(ret))
            },(err)=>{
                console.log('-------------拉取离线的jcinfo失败')
                console.log(err)
            })

        }else if(dataArr[0] === 'offlinepossign') {
            //离线版 拉取签名信息
            let userid = dataArr[1]
            console.log('userid:'+userid)
            let ids = val.substring(userid.length+dataArr[0].length+2)
            ids = ids.replace(/:/g,"-")
            console.log(ids)
            ids = ids.split(',')
            storage.getBatchDataWithIds({
                key: userid+':'+that.state.taskId,
                ids: ids
            }).then(ret=>{
                console.log(ret)
                let response = {}
                for(let i=0; i<ret.length; i++){
                    response[ret[i].location] = ret[i]
                }
                this.refs.webViewRef.postMessage('offlinepossignresponse:'+JSON.stringify(response))
            }).catch(err=>{
                console.log(err)
            })
        }else if(dataArr[0] === 'offlinecanpossign') {
            //离线版 拉取 是否可进行签名（暂不用）
            let userid = dataArr[1]
            console.log('userid:'+userid)
            let ids = val.substring(userid.length+dataArr[0].length+2)
            console.log(ids)
            ids = ids.split(',')
            storage.getBatchDataWithIds({
                key: userid + ':' + that.state.taskId,
                ids: ids
            }).then(ret=>{
                console.log(ret)
                let response = {}
                for(let i=0; i<ret.length; i++){
                    response[ret[i].location] = ret[i]
                }
                this.refs.webViewRef.postMessage('offlinepossignresponse:'+JSON.stringify(response))
            }).catch(err=>{
                console.log(err)
            })
        }else if(dataArr[0] === 'offlinepossignmodify') {
            //离线版 拉取 是否可修改 签名（暂不用）
            let userid = dataArr[1]
            console.log('userid:'+userid)
            let ids = val.substring(userid.length+dataArr[0].length+2)
            console.log(ids)
            ids = ids.split(',')
            storage.getBatchDataWithIds({
                key: userid + ':' + that.state.taskId,
                ids: ids
            }).then(ret=>{
                console.log(ret)
                let response = {}
                for(let i=0; i<ret.length; i++){
                    response[ret[i].location] = ret[i]
                }
                this.refs.webViewRef.postMessage('offlinepossignresponse:'+JSON.stringify(response))
            }).catch(err=>{
                console.log(err)
            })
        }else if(dataArr[0] === 'offlinecomplish') {
            //离线版 拉取 完工签名信息
            let userid = dataArr[1]
            let jcid = dataArr[2]
            this._loadData(userid + ':' +that.state.taskId,'jccomplish-'+jcid,(ret)=>{
                this.refs.webViewRef.postMessage('offlinecomplishresponse:'+JSON.stringify(ret))
            },(err)=>{
                console.log('拉取离线完工签名 失败')
            })
        }else if(dataArr[0] === 'offlinecancomplish') {
            //离线版 拉取 是否可以完工签名
            let userid = dataArr[1]
            let jcid = dataArr[2]
            this._loadData(userid +  ':' + that.state.taskId,'jccomplishverify-'+jcid,(ret)=>{
                this.refs.webViewRef.postMessage('offlinecancomplishresponse:'+JSON.stringify(ret))
            },(err)=>{
                console.log('拉取是否可签离线完工 失败')
            })
        }else if(dataArr[0] === 'offlinecomplishmodify') {
            //离线版 拉取 是否可以修改完工签名
            let userid = dataArr[1]
            let jcid = dataArr[2]
            this._loadData(userid + ':' + that.state.taskId,'jccomplishmodifyverify-'+jcid,(ret)=>{
                console.log('---------------------修改完工')
                console.log(ret)
                this.refs.webViewRef.postMessage('offlinecomplishmodifyresponse:'+JSON.stringify(ret))
            },(err)=>{
                console.log('拉取是否可修改离线完工 失败')
            })
        }else if(dataArr[0] === 'offlineimages') {
            // debugger
            console.log('*****************************************')
            // 离线版拉取 图片base64字符串
            let userid = dataArr[1]
            let ids = dataArr[2]
            let jcid = dataArr[3]
            console.log(ids)
            ids = ids.split(',')
            storage.getBatchDataWithIds({
                key: userid+':'+that.state.taskId,
                ids: ids
            }).then(ret=>{
                console.log(ret)
                let response = {}
                for(let i=0; i<ret.length; i++){
                    response[ids[i]] = ret[i]
                }
                this.refs.webViewRef.postMessage('offlineimagesresponse:'+JSON.stringify(response))
            }).catch(err=>{
                console.log(err)
                this.refs.webViewRef.postMessage('offlineimagesresponse:'+JSON.stringify({}))
            })
        }else if(dataArr[0] === 'log'){
            console.log('#############################jcpage log')
            console.log( val.substring(dataArr[0].length+1))
        }else if(dataArr[0] === 'offlineinputs'){
            // 离线版拉取input
            let userid = dataArr[1]
            let ids = dataArr[2]
            let jcid = dataArr[3]
            console.log(ids)
            ids = ids.split(',')
            storage.getBatchDataWithIds({
                key: userid+':'+that.state.taskId+':input',
                ids: ids
            }).then(ret=>{
                console.log(ret)
                let response = {}
                for(let i=0; i<ret.length; i++){
                    response[ids[i]] = ret[i]
                }
                this.refs.webViewRef.postMessage('offlineinputsresponse:'+JSON.stringify(response))
            }).catch(err=>{
                console.log(err)
                this.refs.webViewRef.postMessage('offlineinputsresponse:'+JSON.stringify({}))
            })
        }else if(dataArr[0] === 'offlineinputschange'){
            console.log('qwq')
            // 离线版拉取input是否能修改
            let userid = dataArr[1]
            let ids = dataArr[2]
            let jcid = dataArr[3]
            console.log(ids)
            ids = ids.split(',')
            storage.getBatchDataWithIds({
                key: userid+':'+that.state.taskId+':inputchange',
                ids: ids
            }).then(ret=>{
                console.log(ret)
                let response = {}
                for(let i=0; i<ret.length; i++){
                    response[ids[i]] = ret[i]
                }
                this.refs.webViewRef.postMessage('offlineinputschangeresponse:'+JSON.stringify(response))
            }).catch(err=>{
                console.log(err)
                this.refs.webViewRef.postMessage('offlineinputschangeresponse:'+JSON.stringify({}))
            })
        }else if(dataArr[0] === 'updateinput'){
            console.log('updateinput')
            // 离线版更新input值
            let userid = dataArr[1]
            let jcid = dataArr[2]
            let dbid = dataArr[3]
            let data = val.substring(dataArr[0].length+1+userid.length+1+jcid.length+1+dbid.length+1)
            data = JSON.parse(data)
            this._saveData(userid+':'+that.state.taskId+':input',dbid,data,'离线存储Input框数据');
            console.log(data)
            
            
        }else if(dataArr[0] === 'updateinputpost'){
            console.log('updateinputpost')
            // 离线版存储input post的请求
            let userid = dataArr[1]
            let jcid = dataArr[2]
            let dbid = dataArr[3]
            let data = val.substring(dataArr[0].length+1+userid.length+1+jcid.length+1+dbid.length+1)
            data = JSON.parse(data)
            // this._saveData
            console.log(data)
            console.log('save key :     '+userid+':offlineinput:'+this.state.taskId)
            this._saveData(userid+':offlineinput:'+this.state.taskId,dbid,data,'离线存储Input框请求的数据');
            
        }
    }

    handleConnectivityChange = (status)=> {
        let that = this;
        //直接获取是否有网的接口
        NetInfo.isConnected.fetch().done((isConnected) => {
            console.log('切换网络->当前网络状态为:' + isConnected)
            if(isConnected){
                that.setState({
                    online: true
                })
            }else{
                //offline
                // that.setState({url: "http://localhost:8085/airline/local.html"})
                that.setState({url: "file:///android_asset/offlineweb/local.html"})
                that.setState({
                    online: false
                })
            }
        })
    }

    componentDidMount(){
        let that = this
        // this.props.navigation.setParams({ openPicker: this.openPicker })
        this.props.navigation.setParams({ refresh: this.refreshJc })
        // Orientation.lockToLandscapeLeft()   // 锁定横屏
        this.refs.webViewRef.reload()       // 重新加载页面
        if(Platform.OS === 'android'){
            console.log((this.state.userId + ':' + this.state.userName + ':' + this.state.jcId))
            // if(!this.state.inited){
            //     console.log('init Api')
                NativeModules.AnySignModule.initApi(this.state.userId + ':' + this.state.userName + ':' + this.state.jcId) // 电签初始化
            //     this.setState({
            //         inited:true
            //     })
            // }
            
        }else{
            //NativeModules.AnySignModule.initApi(this.state.userId + ':' + this.state.userName + ':' + this.state.jcId)
        }
        // 接收签名图片信息，并发送到html
        DeviceEventEmitter.addListener('AndroidToRNMessage',(msg)=>{
            let that = this;
            // alert(this.state.signId)
            console.log("接受来自手机的签名字符串")
            console.log(msg)
            if(this.state.signType === 'date'){  // 日期签署
                this.refs.webViewRef.postMessage('base64:date'  + msg)
            }else if(this.state.signType === 'jc'){
                this.refs.webViewRef.postMessage('base64:jcid' + ':' + msg)
            }else if(this.state.signType === 'pos'){
                console.log(1)
                console.log(this.state.location)
                console.log(this.state.location.indexOf(','))
                if(this.state.location.indexOf(',') >0){
                    // 批签 批签肯定都是没有签名的  都走新签
                    console.log('批签')
                    let locationArr = this.state.location.split(',')
                    console.log(locationArr)
                    let signidArr = this.state.signId.split(',')
                    console.log(signidArr)
                    let posArr = this.state.posId.split(',')
                    console.log(posArr)
                    for(let i=0;i<locationArr.length;i++){
                        let signInfo = {
                            signid: signidArr[i],
                            posid: posArr[i],
                            base64: msg,
                            fromoffline: true,
                            location: locationArr[i],
                        }
                        that._saveData(this.state.userId+':'+that.state.taskId,'jcpossign-'+this.state.jcId+'-'+locationArr[i],signInfo)
                        this.refs.webViewRef.postMessage('base64:'  + signidArr[i] + ':' + msg + ':' + locationArr[i],signInfo)
                    }
                }else{
                    // 单签
                    that._loadData(this.state.userId + ':' + that.state.taskId,'jcpossign-'+this.state.jcId+'-'+this.state.location,(ret)=>{
                        console.log("修改已有")
                        ret.base64 = msg
                        that._saveData(this.state.userId + ':' + that.state.taskId,'jcpossign-'+this.state.jcId+'-'+this.state.location,ret)
                        this.refs.webViewRef.postMessage('base64:'  + this.state.signId + ':' + msg + ':' + this.state.location)
                    },(err)=>{
                        console.log("新签没有的签名")
                        let signinfo = {
                            signid: that.state.signId,
                            posid: that.state.posId,
                            base64: msg,
                            fromoffline: true
                        }
                        that._saveData(this.state.userId + ':' + that.state.taskId,'jcpossign-'+this.state.jcId+'-'+this.state.location,signinfo)
                        this.refs.webViewRef.postMessage('base64:'  + this.state.signId + ':' + msg + ':' + this.state.location)
                    })
                }
                
                
                
            }
        })
        // 接受发过来的 离线签名请求包
        DeviceEventEmitter.addListener('AndroidToRNMessageOffline',(msg)=>{
            console.log(msg)
            console.log(msg.split('-split-'))
            console.log('当前的taskId:'+this.state.taskId)
            let locationArr = that.state.location.split(',')
            let postArr = msg.split('-split-')
            for(let i=0;i<locationArr.length;i++){
                that._saveData(this.state.userId+':offlinepost:'+this.state.taskId,'offlinepost'+that.state.jcId+locationArr[i],postArr[i])
            }
            // that._saveData(this.state.userId+':offlinepost:'+this.state.taskId,'offlinepost'+that.state.jcId+that.state.location,msg)
            // axios.post('http://wechattest.ameco.com.cn:8090/xmis/AirlineTaskAction/signJcData.do', msg).then(response => {
            //     console.log(response)
            // })
        })

        // 接受发过来的 log 输出到控制台
        DeviceEventEmitter.addListener('AndroidToRNMessageLog',(msg)=>{
            console.log('来自安卓的log')
            console.log(msg)
            let debug = false
            if(debug){
                axios.post('http://192.168.0.105:8080/sorua/test.do?encryp',{data:msg}).then(ret=>{

                }).catch(err=>{
                    alert(err.message)
                })
            }
           
        })

        // 签名取消或者失败返回信息
        DeviceEventEmitter.addListener('ErrorToRNMessage',(msg)=>{
            //debugger
            if(this.state.signType === 'jc'){
                this.refs.webViewRef.postMessage('error:jcid')
            }else if(this.state.signType === 'pos'){
                this.refs.webViewRef.postMessage('error:' + this.state.location)
            }
        })
        // 电子签名
        /*
        DeviceEventEmitter.addListener('AnySignInfo',(msg)=>{
            alert('debugger')
            axios.post('http://192.168.0.131:8080/xmis/AirlineTaskAction/signJcData.do', {params: {jcdata: msg}}).then(response => {
                debugger
            })
        })*/
    }
    componentWillMount() {
        const { navigation } = this.props
        // 接收工卡和人员信息
        this.setState({
            jcId: navigation.getParam('jcId', 'NO-ID'),
            userId: navigation.getParam('userId', 'USER-ID'),
            userName: navigation.getParam('userName', 'USER-NAME'),
            url: navigation.getParam('url', 'URL'),
            // url: "file:///android_asset/offlineweb/local.html",
            taskState: navigation.getParam('taskState', 'STATE'),
            online: navigation.getParam('online',false),
            taskId: navigation.getParam('taskId',false),
        })
        //监听网络状态改变
        NetInfo.addEventListener('connectionChange', this.handleConnectivityChange)
    }
    componentWillUnmount(){
        // Orientation.unlockAllOrientations() // 解锁横屏
        console.log('unmount')
        DeviceEventEmitter.removeAllListeners('AndroidToRNMessage') // 清除消息监听（否则第二次签名会报错）
        DeviceEventEmitter.removeAllListeners('ErrorToRNMessage')
        DeviceEventEmitter.removeAllListeners('AndroidToRNMessageLog')
        NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange)
        // DeviceEventEmitter.removeAllListeners('AnySignInfo')
    }
    render() {
        let uri = "file:///android_asset/offlineweb/local.html"
        // let uri = "http://localhost:8085/airline/local.html"
        if(!this.state.online) {
            console.log('离线模式: uri = '+uri);
        }else {
            uri = this.state.url + '/xmis/LMJcAction/GetJcHtmlPage.do'
            // uri = 'http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcHtmlPage.do'
        }
        // uri = "http://localhost:8085/airline/local.html"
        console.log('电签页面地址：'+uri + '?jcid=' + this.state.jcId + '&esign=' + this.state.taskState + '&userid=' + this.state.userId + '&username='+this.state.userName)
        return (
            <View style={styles.container}>
                <WebView
                    ref="webViewRef"
                    style={styles.base}
                    // source={{uri: this.state.url + '/xmis/LMJcAction/GetJcHtmlPage.do?jcid=' + this.state.jcId + '&esign=' + this.state.taskState + '&userid=' + this.state.userId }}
                    source={{uri: uri + '?jcid=' + this.state.jcId + '&esign=' + this.state.taskState + '&userid=' + this.state.userId + '&username='+this.state.userName+'' }}
                    //source={{uri: 'http://192.168.0.131:8080/xmis/LMJcAction/GetJcHtmlPage.do?jcid=3206514'}}
                    //source={{uri: this.state.url + '/jc/12186636.html'}}
                    javaScriptEnabled
                    startInLoadingState
                    scalesPageToFit
                    onMessage={(msg) => {
                        console.log('message do')
                        this.esignOperation(msg.nativeEvent.data)
                    }}
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
    },
})

export default JcContainer
