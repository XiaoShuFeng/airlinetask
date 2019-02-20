import React from 'react'
import axios from '../utils/MyAxios'
import Axios from 'axios'
import ImagePicker from 'react-native-image-picker'
import JPushModule from 'jpush-react-native'
import storage from '../components/storage'
import SoraModule from '../components/SoraModule'
// import htmldata from '../components/data'
import {
    View,
    StyleSheet,
    NativeModules,
    Platform,
    Modal,
    Text,
    Image,
    TouchableHighlight,
    WebView,
    NetInfo } from 'react-native'

var options = {
    title: '选取照片',
    takePhotoButtonTitle: '拍照',
    chooseFromLibraryButtonTitle: '相册',
    cancelButtonTitle: '取消',
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
}

class HomeContainer extends React.Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props)
        this.state = {
            url: '',
            images: '',
            imagePath: '',
            imageSize: '',
            imageType: '',
            userId: '',
            taskId: '',
            jcId: '',
            modalVisible: false,
            online: false,
            loginName: '',
        }
    }

    _saveData =(key,id,data,msg)=> {
        // this._saveDataFile(key,id,data,msg)
        // console.log("\n")
        // console.log("---- save start..")
        // console.log('key:'+key+'  id:'+id+ ' msg:'+msg || '');
        // console.log('[debugmode] ')
        // key = Math.random().toFixed(2)*100
        // console.log('key:'+key+'  id:'+id+ ' msg:'+msg || '');
        storage.save({
            key: key,
            id: id,
            data: data,
            //expires为有效时间
            expires: null
        })
        
        // console.log(data)
        // console.log('save end ---------------')
        // console.log("\n")
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

    _loadBatchedData = (key,ids,callback,fail)=>{
        console.log("load")
        console.log('key:'+key+'  id:'+ids)
        key = key.replace(/:/g,"/")
        SoraModule.getBatchedData(key,"",ids,(data)=>{
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

    componentWillMount() {
        let that = this
        //直接获取是否有网的接口
        NetInfo.isConnected.fetch().done((isConnected) => {
            console.log('当前网络状态为:' + isConnected)
            if(isConnected){
                that.setState({
                    online: true
                })
            }else{
                that.setState({
                    online: false
                })
            }
        })
        //监听网络状态改变
        NetInfo.addEventListener('connectionChange', this.handleConnectivityChange)

        axios.get('/app_site').then(response => {
            // axios.get('/app_intranet').then(response => {
            if(response.data !== 'fail'){
                this.setState({
                    url: response.data
                    // url: "http://localhost:8083/"
                    // url: "http://123.206.124.66/airline/"
                }, () => {
                    if(Platform.OS === 'android'){
                        NativeModules.AnySignModule.setUrl(this.state.url)
                    }else{

                    }
                })

            }else{
                alert('初始化失败！')
            }
        }).catch(error => {
            that.setState({url: "file:///android_asset/offlineweb/index.html"})
            // this.setState({url: "http://localhost:8082/"})
        })
    }

    componentDidMount(){
        this.refs.webViewRef.reload()
        //Android版本 必须执行
        JPushModule.notifyJSDidLoad(resultCode =>{
            if(resultCode===0){
                //alert(0);
            }
        })
        JPushModule.initPush();
        //初始化推送模块
        // JPushModule.initPush();
        //获取设备唯一的注册id
        JPushModule.getRegistrationID((id)=>{
            // console.log(id);
            this.setState({"registrationId":id})
        })
        // storage.getAllDataForKey('95048:3312595').then(res=>{
        //     console.log('读取已经存储的图片')
        //     console.log(res)
        // }).catch(err=>{
        //     console.log(err.message)
        // })
        // NativeModules.AnySignModule.initApi(this.state.userId + ':' + this.state.userName + ':' + this.state.jcId) // 电签初始化
    

    }

    componentWillUnmount(){
        NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange)
    }

    handleConnectivityChange = (status)=> {
        let that = this;
        //直接获取是否有网的接口
        NetInfo.isConnected.fetch().done((isConnected) => {
            console.log('切换网络->当前网络状态为:' + isConnected)
            if(isConnected){
                axios.get('/app_site').then(response => {
                    if(response.data !== 'fail'){
                        that.setState({url: response.data})
                        // that.setState({url: "http://localhost:8083/"})
                        // that.setState({url: "http://123.206.124.66/airline/"})
                        that.setState({
                            online: true
                        })
                        if(Platform.OS === 'android'){
                            NativeModules.AnySignModule.setUrl(response.data)
                        }else{
    
                        }
                    }else{
                        alert('初始化失败！')
                    }
                }).catch(error => {
                    console.log(error)
                })
            }else{
                //offline
                // that.setState({url: "http://localhost:8082/"})
                that.setState({url: "file:///android_asset/offlineweb/index.html"})
                that.setState({
                    online: false
                })
            }
        })
    }

    bindPush = (userId,registrationId)=>{
        //let param = new URLSearchParams()
        //param.append('userId', userId)
        //param.append('registrationId', registrationId)
        JPushModule.getRegistrationID((id)=>{
            let url = 'http://192.168.43.3:8080/jpush/bind';
            url = 'http://123.206.124.66:9090/jpush/bind?userId='+userId+'&registrationId='+id;
            // alert(url);
            axios.post(url, '',).then(res => {
                let data = res.data;
                if(data=='OK'){
                    alert('绑定成功');
                }
                //console.log(data);
            }).catch(error => {
                alert("绑定Jpush出错");
                console.log(error)
            })
        })
    }

    openPicker = (userId, taskId, jcId) => {
        // var url = 'http://192.168.0.131:8080'
        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled image picker')
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error)
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton)
            }
            else {

                axios.post(this.state.url + '/xmis/AirlineTaskAction/upLoadJcSignEvidence.do', {
                    // axios.post('http://192.168.0.139:8080/xmis/AirlineTaskAction/upLoadJcSignEvidence.do', {
                    jcid: jcId,
                    userid: userId,
                    taskid: taskId,
                    filename: response.fileName,
                    filesize: response.fileSize,
                    filedata: response.data,
                    filetype: 'jc'
                }).then(res => {
                    let data = res.data
                    if(data.result === 'success'){
                        NativeModules.AnySignModule.showToast('上传文件成功！')
                    }else{
                        NativeModules.AnySignModule.showToast('上传文件失败！')
                    }
                }).catch(error => {
                    console.log(error)
                })
            }
        });
    }

    openPicker1 = () => { //userId, taskId, jcId) => {
        // var url = 'http://192.168.0.131:8080'
        ImagePicker.showImagePicker(options, (response) => {
            if (response.fileSize > 10240000) {
                NativeModules.AnySignModule.showToast('文件太大，超过了10M，请重新选择。')
                return
            }

            if (response.didCancel) {
                console.log('User cancelled image picker')
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error)
            }
            else {
                //NativeModules.AnySignModule.upLoadFile(response.path + ';' + response.type  + ';' + response.fileSize + ';' + userId + ';' + taskId + ';' + jcId)
                this.setState({
                    images: 'data:image/png;base64,' + response.data,
                    imagePath: response.path,
                    imageType: response.type,
                    imageSize: response.fileSize
                }, () => {
                    this.setModalVisible(!this.state.modalVisible)
                })
            }
        })
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    upLoadImage() {
        NativeModules.AnySignModule.upLoadFile(this.state.imagePath + ';' + this.state.imageType  + ';' + this.state.imageSize + ';' + this.state.userId + ';' + this.state.taskId + ';' + this.state.jcId)
        this.setModalVisible(!this.state.modalVisible)
    }

    _toast = (msg)=> {
        if(Platform.OS === 'android'){
            // 安卓进行hint提示
            NativeModules.AnySignModule.showToast(msg)
        }else {
            // 苹果进行hint提示
            // 暂无
        }
    }

    _downloadData = (taskid)=>{
        console.log('go function ...')
        if (taskid == undefined) {
            this.refs.webViewRef.postMessage("downloadFinish:no:"+taskid)
            return
        }
        let jcpageFinish = false;
        let jcinfoFinish = false;
        let possignFinish = false;
        let jcdataFinish = false;
        let imageFinish = false;
        let inputFinish = false;
        let accomplishFinish = false;
        let checkAllFinish = ()=>{
            return (
                jcpageFinish 
                && jcinfoFinish
                && possignFinish
                && jcdataFinish
                && imageFinish
                && inputFinish
                && accomplishFinish
            )
        }
        // 防止this指针错乱
        let that = this;
        let userid = this.state.userId; 
        // 取得当前任务的明细数据
        let itemlist = that.state.detailinfo[taskid]
        // 标记存在电签页面的次数（有可能有的任务没有电签任务 没法下载，就需要这里进行判别了）
        let mark = 0
        let neededitemlist = []
        for ( let i=0; i < itemlist.length; i++ ) {
            if(itemlist[i].dataType === 'TD航线' && itemlist[i].jcId !=='' && itemlist[i].jcId !==undefined && itemlist[i].taskState === 'on-work' && itemlist[i].layoverJcId !==undefined) {
                neededitemlist.push(itemlist[i])
            }
        }
        // 循环有用明细数据 拉取明细里对应签名相关内容
        for ( let i=0; i < neededitemlist.length; i++ ) {
            
            console.log("\n\n")
            console.log('------第'+i+1+'次循环----本次ittem数据为：')
            console.log(neededitemlist[i])
            if(neededitemlist[i].dataType === 'TD航线' && neededitemlist[i].jcId !=='' && neededitemlist[i].jcId !==undefined && neededitemlist[i].taskState === 'on-work' && neededitemlist[i].layoverJcId !==undefined) {
                console.log('------此任务，满足电签条件，进行page数据下载------')
                mark++
                let jcid = neededitemlist[i].layoverJcId
                // axios.get('http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcHtmlPage.do?jcid='+neededitemlist[i].layoverJcId+'&esign=1').then(response => {
                axios.get( that.state.url + '/xmis/LMJcAction/GetJcHtmlPage.do?jcid='+neededitemlist[i].layoverJcId+'&esign=1').then(response => {
                    // 如果是最后一次循环，那么认定jcpage下载成功
                    if (i == neededitemlist.length-1) {
                        jcpageFinish = true
                        console.log('拉取jcpage完毕')
                    }
                    // console.log(response.data)
                    let html = response.data
                    // 存储电签html语句
                    that._saveDataFile(userid+':'+taskid,'jcpage'+neededitemlist[i].layoverJcId,response.data,'离线存储html语句至文件')
                    // that._saveData(userid+':'+taskid,'jcpage'+neededitemlist[i].layoverJcId,response.data,'离线存储html语句')
                    // 拉取jcinfo 并存储
                    // axios.post('http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcInfo.do?jcid='+neededitemlist[i].layoverJcId).then(jcinforesponse =>{
                    axios.post( that.state.url + '/xmis/LMJcAction/GetJcInfo.do?jcid='+neededitemlist[i].layoverJcId).then(jcinforesponse =>{
                        // console.log('拉取jcinfo成功')
                        // console.log(jcinforesponse.data)
                        if (i == neededitemlist.length-1) {
                            jcinfoFinish = true
                            console.log('拉取jcinfo完毕')
                            if(checkAllFinish()){
                                console.log(jcpageFinish 
                                    && jcinfoFinish
                                    && possignFinish
                                    && jcdataFinish
                                    && imageFinish
                                    && inputFinish
                                    && accomplishFinish)
                                NativeModules.AnySignModule.showToast('数据离线成功 jcinfo')
                                that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                            }
                        }
                        // that._saveData(userid+':'+taskid,'jcinfo'+neededitemlist[i].layoverJcId,JSON.stringify(jcinforesponse.data),'存储jcinfo')
                        that._saveData(userid+':'+taskid,'jcinfo'+neededitemlist[i].layoverJcId,jcinforesponse.data,'存储jcinfo')
                    }).catch(err =>{
                        // 拉取html 页面是必须成功的不允许失败
                        console.log('拉取jcinfo 失败')
                        console.log(err)
                        that._removeDownloaded(userid,taskid)
                        that.refs.webViewRef.postMessage("downloadFinish:no:"+taskid)
                        that._toast('下载失败：下载签名页航空基础信息失败')
                        return
                    })

                    // 拉取所有的签名位置数据
                    // 先正则对html进行解析取出所有签名的 location
                    
                    let reg = /pos_location_\d+/g
                    let arr = html.match(reg) || []
                    for (let j =0; j < arr.length; j++) {
                        let location = arr[j].substring(13)
                        // axios.post('http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcPosSign.do?jcid='+neededitemlist[i].layoverJcId+'&location='+location).then(postionresponse =>{
                        axios.post( that.state.url + '/xmis/LMJcAction/GetJcPosSign.do?jcid='+neededitemlist[i].layoverJcId+'&location='+location).then(postionresponse =>{    
                            // console.log('拉取签名位置信息成功')
                            // console.log(postionresponse.data)
                            // 标记一下签名内容是来自离线签名还是本来有的签名
                            if (postionresponse.data.base64) {
                                // console.log('已有签名')
                                postionresponse.data.fromoffline = false
                                // 有签名的进行验证一下是否能改签名
                                // 现在不需要了，离线就是可以修改
                                // axios.post('http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/VerifySigner.do?jcid='+jcid+'&location='+location+'&userid='+info.userid).then(res=>{
                                //     // console.log('验证是否能改签 成功')
                                //     // console.log(res.data)
                                //     res.data.location = location
                                //     that._saveData(info.userid,'jcpossignmodifyverify:'+jcid+':'+location,res.data,'存储是否能够改签')
                                // }).catch(err=>{
                                //     console.log('验证是否能改签 失败')
                                //     console.log(err)
                                // })
                            }else {
                                postionresponse.data.fromoffline = true
                                // 米有签名的查询一下是否能签名
                                axios.post( that.state.url + '/xmis/LMJcAction/VerifyJcPosSign.do?jcid='+jcid+'&location='+location).then(res=>{
                                    // console.log('验证是否能签名 成功')
                                    // console.log(res.data)
                                    that._saveData(userid+':'+taskid,'jcpossignverify:'+jcid+'-'+location,res.data)
                                    // that._saveData(userid+':'+taskid,'jcpossignverify:'+jcid+'-'+location,JSON.stringify(res.data))
                                }).catch(err=>{
                                    console.log('验证是否能签名 失败')
                                    console.log(err)
                                })
                            }
                            postionresponse.data.location = location
                            // that._saveData(userid+':'+taskid,'jcpossign-'+jcid+'-'+location,JSON.stringify(postionresponse.data))
                            that._saveData(userid+':'+taskid,'jcpossign-'+jcid+'-'+location,postionresponse.data)
                            if(i == neededitemlist.length-1 && j ==arr.length-1){
                                console.log('拉取possign完毕')
                                possignFinish = true
                                if(checkAllFinish()){
                                    console.log(jcpageFinish 
                                        && jcinfoFinish
                                        && possignFinish
                                        && jcdataFinish
                                        && imageFinish
                                        && inputFinish
                                        && accomplishFinish)
                                    NativeModules.AnySignModule.showToast('数据离线成功 pos')
                                    that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                                }
                            }


                            // 拉取后台要用的jcdata
                            axios.get( that.state.url + '/xmis/AirlineTaskAction/getJcData.do?signtype=pos&jcid='+jcid+'&posid='+postionresponse.data.posid+'&signid='+postionresponse.data.signid+'&userid='+userid).then(res=>{
                                // console.log('拉取jcdata成功')
                                // console.log(res.data)
                                if(j == arr.length-1 && i == neededitemlist.length-1){
                                    console.log('拉取jcdata完毕')
                                    jcdataFinish = true
                                    console.log({
                                        jcpageFinish,
                                        jcinfoFinish  ,
                                        possignFinish ,
                                        jcdataFinish  ,
                                        imageFinish ,
                                        inputFinish ,
                                        accomplishFinish,
                                    })
                                    if(checkAllFinish()){
                                        NativeModules.AnySignModule.showToast('数据离线成功 jcdata')
                                        that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                                    }
                                    // NativeModules.AnySignModule.showToast('数据离线成功')
                                    // that.refs.webViewRef.postMessage("downloadFinish:yes:"+info.taskid)
                                }
                                // console.log(res.data)
                                // that._saveData(userid+':'+taskid,'jcdata-'+jcid+'-'+postionresponse.data.posid+'-'+postionresponse.data.signid,JSON.stringify(res.data),'存储离线jcdata')
                                that._saveData(userid+':'+taskid,'jcdata-'+jcid+'-'+postionresponse.data.posid+'-'+postionresponse.data.signid,res.data,'存储离线jcdata')
                            }).catch(err=>{
                                console.log('拉取jcdata失败')
                                that._removeDownloaded(userid,taskid)
                                that.refs.webViewRef.postMessage("downloadFinish:no:"+taskid)
                                that._toast('下载失败：下载签名加密数据失败')
                                return
                            })
                        }).catch(err =>{
                            console.log('拉取签名位置信息失败')
                            console.log(err)
                            that._removeDownloaded(userid,taskid)
                            that.refs.webViewRef.postMessage("downloadFinish:no:"+taskid)
                            that._toast('下载失败：下载签名页的工序签名时出错')
                            return
                        })
                        
                        
                    }
                    // 拉取页面里的图片 下载成base64进行存储
                    // 正则
                    let imgreg = /\d+.png/g
                    
                    let imgarr = html.match(imgreg) || []
                    for(let k=0;k<imgarr.length;k++){
                        axios.get( that.state.url + '/xmis/LMJcAction/GetJcImage.do?n='+imgarr[k],{responseType:'blob'}).then(res=>{
                            let blob = res.data
                            let oFileReader = new FileReader();
                            oFileReader.onloadend = function (e) {
                                let base64 = e.target.result;
                                that._saveData(userid+':'+taskid,imgarr[k],base64,'离线存储网页里的图片')
                                if(i == neededitemlist.length-1 && k ==imgarr.length-1){
                                    console.log('拉取image完毕')
                                    imageFinish = true
                                    if(checkAllFinish()){
                                        NativeModules.AnySignModule.showToast('数据离线成功 image')
                                        that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                                    }
                                }
                            };
                            oFileReader.readAsDataURL(blob);
                        }).catch(err=>{
                            console.log('存在下载失败的图片:'+err.message)
                    
                            that._toast('警告：存在下载失败的图片，不影响离线签名')
                        })
                    }
                    if(imgarr.length==0){
                        console.log('拉取image完毕(没有图片下载)')
                        imageFinish = true
                        if(checkAllFinish()){
                            NativeModules.AnySignModule.showToast('数据离线成功 image')
                            that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                        }
                    }
                    // 拉取输入框信息 
                    let inputreg = /fieldlocation_\d+/g
                    let inputarr = html.match(inputreg) || []
                    for(let l=0;l<inputarr.length;l++){
                        let dbid = inputarr[l].substring(14)
                        axios.post( that.state.url + '/xmis/LMJcAction/GetJcHtmlInputValue.do?jcid='+jcid+'&dbid='+dbid).then(r=>{
                            console.log('****************************************************')
                            
                            if(r.data.value!=undefined) {
                                r.data.fromoffline = false
                            }else {
                                r.data.fromoffline = true
                            }
                            // that._saveData(userid+':'+taskid+':input',dbid,JSON.stringify(r.data),'离线存储Input框数据')
                            that._saveData(userid+':'+taskid+':input',dbid,r.data,'离线存储Input框数据')
                            axios.post( that.state.url + '/xmis/LMJcAction/VerifyInputValue.do?jcid='+jcid+'&userid='+userid+'&dbid='+dbid+'&value='+r.data.value).then(rsponse=>{
                                // console.log('*********************************************')
                                // console.log('http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/VerifyInputValue.do?jcid='+jcid+'&userid='+info.userid+'&dbid='+dbid+'&value='+r.data.value)
                                that._saveData(userid+':'+taskid+':inputchange',dbid,rsponse.data,'离线存储是否能修改Input框数据')
                                // that._saveData(userid+':'+taskid+':inputchange',dbid,JSON.stringify(rsponse.data),'离线存储是否能修改Input框数据')
                                if(i == neededitemlist.length-1 && l ==inputarr.length-1){
                                    console.log('拉取input完毕')
                                    console.log({
                                        jcpageFinish,
                                        jcinfoFinish  ,
                                        possignFinish ,
                                        jcdataFinish  ,
                                        imageFinish ,
                                        inputFinish ,
                                        accomplishFinish,
                                    })
                                    inputFinish = true
                                    if(checkAllFinish()){
                                        
                                        that._toast('数据离线成功')
                                        that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                                    }
                                }
                            }).catch(err=>{
                                console.log('拉取是否能修改input失败')
                            })

                            
                        }).catch(err=>{
                            console.log('拉取离线input失败')
                            that._removeDownloaded(userid,taskid)
                            that.refs.webViewRef.postMessage("downloadFinish:no:"+taskid)
                            that._toast('下载失败：下载签名页-输入框数据时出错')
                            return
                        })
                    }
                    if(inputarr.length==0){
                        console.log('拉取input完毕(没有input)')
                        inputFinish = true
                        if(checkAllFinish()){
                            
                            that._toast('数据离线成功')
                            that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                        }
                    }
                    
                    

                    // 拉取完工签名数据
                    axios.post( that.state.url + '/xmis/LMJcAction/GetJcComplishSign.do?jcid='+neededitemlist[i].layoverJcId).then(complishresponse =>{
                        // console.log('拉取完工签名成功')
                        // console.log(complishresponse.data)
                        if(complishresponse.data.base64) {
                            complishresponse.data.fromoffline = false
                        }else {
                            complishresponse.data.fromoffline = true
                        }
                        
                        that._saveData(userid+':'+taskid,'jccomplish-'+jcid,complishresponse.data,'拉取完工签名')
                        // that._saveData(userid+':'+taskid,'jccomplish-'+jcid,JSON.stringify(complishresponse.data),'拉取完工签名')
                        if(i == neededitemlist.length-1 ){
                            console.log('拉取complish完毕')
                            accomplishFinish = true
                            if(checkAllFinish()){
                                NativeModules.AnySignModule.showToast('数据离线成功 complish')
                                that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                            }
                        }
                    }).catch(err =>{
                        console.log('拉取完工签名信息失败')
                        console.log(err)
                    })
                    
                    // 拉取是否能签完工签名
                    axios.post( that.state.url + '/xmis/LMJcAction/VerifyJcComplishSign.do?jcid='+neededitemlist[i].layoverJcId).then(cancomplishresponse =>{
                        
                        // console.log('拉取是否能完工签名成功')
                        // console.log(cancomplishresponse.data)
                        // that._saveData(userid+':'+taskid,'jccomplishverify-'+jcid,JSON.stringify(cancomplishresponse.data),'拉取是否能完工签名')
                        that._saveData(userid+':'+taskid,'jccomplishverify-'+jcid,cancomplishresponse.data,'拉取是否能完工签名')
                    }).catch(err =>{
                        
                        console.log('拉取是否能完工签名信息失败')
                        console.log( that.state.url + '/xmis/LMJcAction/VerifyJcComplishSign.do?jcid='+neededitemlist[i].layoverJcId)
                        console.log(err)
                    })

                    // 拉取是否能修改完工签名
                    axios.post( that.state.url + '/xmis/LMJcAction/VerifySigner.do?jcid='+neededitemlist[i].layoverJcId+'&signtype=accomplishedSign&userid='+userid).then(canmodifycomplishresponse =>{
                        // console.log('拉取是否能修改完工签名成功!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                        // console.log(canmodifycomplishresponse.data)
                        
                        that._saveData(userid+':'+taskid,'jccomplishmodifyverify-'+jcid,canmodifycomplishresponse.data,'拉取是否能修改完工')
                        // that._saveData(userid+':'+taskid,'jccomplishmodifyverify-'+jcid,JSON.stringify(canmodifycomplishresponse.data),'拉取是否能修改完工')
                    }).catch(err =>{
                        console.log('拉取是否能修改完工签名信息失败')
                        console.log(err)
                    })

                }).catch(error => {
                    console.log('拉取jcpage失败')
                    console.log(error)
                    that._removeDownloaded(userid,taskid)
                    that.refs.webViewRef.postMessage("downloadFinish:no:"+taskid)
                    that._toast('下载失败：下载签名页时出错')
                    return
                })
            }
            // 没有一条数据能下载签名页
            if(i=== neededitemlist.length-1 && mark === 0){
                // 留给0.500秒时间给
                // that._saveData(info.username,'offlinedtask',ret)执行完毕 
                setTimeout(()=>{
                    NativeModules.AnySignModule.showToast('数据离线成功，但无签名页面可下载')
                    that.refs.webViewRef.postMessage("downloadFinish:yes:"+taskid)
                },500)
                
            }

        }
    }

    _removeDownloaded = (userid,taskid)=>{
        let that = this
        storage.clearMapForKey(userid+':'+taskid)
        storage.clearMapForKey(userid+':'+taskid+':input')
        storage.clearMapForKey(userid+':'+taskid+':inputchange')
        // 清除相关离线数据
        // 读取当前的已离线列表
        // 删除当前的 再进行保存
        that._loadData(
            that.state.loginName,
            'offlinedtask',
            (ret)=>{
                if(ret[taskid]){
                    delete ret[taskid]
                }
                that._saveData(that.state.loginName,'offlinetask',ret,'下载任务'+taskid+'失败')
            },
            (err)=>{
                console.log('找不到任务？怎么回事那你怎么上传的？')
            }
        )
    }

    render() {
        let that = this
        console.log('本次访问的页面为：' + this.state.url)
        return (
            <View style={styles.container}>
                <WebView
                    ref="webViewRef"
                    style={styles.base}
                    source={{uri: this.state.url}}
                    javaScriptEnabled
                    startInLoadingState
                    scalesPageToFit
                    onNavigationStateChange={(event) => {
                        // alert(event)
                        // console.log(event)
                    }}

                    onMessage={(msg) => {
                        // console.log('yo:'+msg.nativeEvent.data)
                        let dataArr = msg.nativeEvent.data.split(':')
                        if (dataArr[0] === 'preview') {
                            const { navigate } = this.props.navigation
                            navigate('jc', {
                                jcId: dataArr[1],
                                userId: dataArr[2],
                                userName: dataArr[3],
                                taskState: dataArr[4],
                                url: this.state.url,
                                online: that.state.online,
                                taskId: this.state.taskId
                            })
                        }else if (dataArr[0] === 'manual') {
                            const { navigate } = this.props.navigation
                            navigate('manual')
                        }else if (dataArr[0] === 'photo') {
                            this.setState({
                                jcId: dataArr[3],
                                userId: dataArr[1],
                                taskId: dataArr[2]
                            }, () => {
                                this.openPicker1()
                            })
                        }else if(dataArr[0] === 'login') {
                            // 推送消息的注册
                            this.bindPush(dataArr[1],this.state.registrationId)
                        }else if(dataArr[0] === 'newlogin') {
                            // 在线时登录 把登陆信息存入手机
                            let userinfo = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            userinfo = JSON.parse(userinfo);
                            this._saveData(userinfo.username,'offlinelogin',userinfo,'持久化存储登录人账号密码');
                            this.setState({
                                userId: userinfo.userid,
                                loginName: userinfo.username
                            })
                           
                            // setTimeout(()=>{
                            //     const { navigate } = this.props.navigation;
                            //     navigate('jc',{
                            //         jcId: 3331663,
                            //         userId: userinfo.userid,
                            //         userName: '姚德政',
                            //         taskState :  '1',
                            //         url: this.state.url,
                            //         online: true,
                            //         taskId: ''
                            //     })
                            // },3000)

                            
                            
                        }else if(dataArr[0] === 'offlinelogin') {
                            console.log('--- offline login ---')
                            let userinfo = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            userinfo = JSON.parse(userinfo);
                            console.log(userinfo)
                            storage.load({
                                key: userinfo.username,
                                id: 'offlinelogin',
                                autoSync: false,
                                syncInBackground: true,
  
                            }).then(ret => {
                                // console.log('offlineloginresponse:'+JSON.stringify(ret));
                                // console.log(userinfo.password)
                                // console.log(ret.password)
                                // 密码验证
                                if(userinfo.password === ret.password){
                                    that.refs.webViewRef.postMessage('offlineloginresponse:'+JSON.stringify(ret))
                                    that.setState({
                                        userId: ret.userid,
                                        loginName: ret.username
                                    })
                                }else{
                                    that.refs.webViewRef.postMessage("offlineloginresponse:fail")
                                }
                                
                            }).catch(err => {
                                //如果没有找到数据且没有sync方法，
                                //或者有其他异常，则在catch中返回
                                console.log(err)
                                that.refs.webViewRef.postMessage("offlineloginresponse:fail")
                            })

                            

                            
                        }else if(dataArr[0] === 'taskinfo') {
                            console.log(' ------ ')
                            console.log(' save/update taskinfo')
                            let taskinfo = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            taskinfo = JSON.parse(taskinfo);
                            this._saveData(taskinfo.username,'offlinetaskinfo',taskinfo,'持久化任务总览数据');
                        }else if(dataArr[0] === 'offlinetaskinfo') {
                            console.log("get offline task info")
                            let username = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            that._loadData(
                                username,
                                'offlinetaskinfo',
                                (ret)=>{
                                    console.log('任务统计结果:')
                                    console.log(ret);
                                    that.refs.webViewRef.postMessage('offlinetaskinfo:'+JSON.stringify(ret))
                                },
                                (err)=>{
                                    console.log('fail')
                                    that.refs.webViewRef.postMessage("offlinetaskinfo:fail")
                                }
                            )
                        }else if(dataArr[0] === 'list') {
                            console.log('save/update tasklist')
                            let listinfo = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            listinfo = JSON.parse(listinfo);
                            // console.log(listinfo)
                            this._saveData(listinfo.username,'list',listinfo,'持久化任务列表数据');
                        }else if(dataArr[0] === 'offlinelist') {
                            console.log("get offline list info")
                            let username = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            that._loadData(
                                username,
                                'list',
                                (ret)=>{
                                    console.log('我的任务列表:')
                                    console.log(ret)
                                    let data = ret.data
                                    that._loadData(username,'offlinedtask',(offlined)=>{
                                        console.log('当前离线任务为')
                                        console.log(offlined)
                                        let offlinedtasklist = []
                                        for ( let index in data ){
                                            if ( offlined[data[index].mdLayoverTaskId]){
                                                offlinedtasklist.push(data[index])
                                            }
                                        }
                                        that.refs.webViewRef.postMessage('offlinelist:'+JSON.stringify(offlinedtasklist))
                                    },(error)=>{

                                    })
                                    
                                },
                                (err)=>{
                                    console.log('fail')
                                    that.refs.webViewRef.postMessage("offlinelist:fail")
                                }
                            )
                        }else if(dataArr[0] === 'listdetail') {
                            console.log('save/update listdetail')
                            let detailinfo = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            detailinfo = JSON.parse(detailinfo);
                            // 这里存入state 方便之后取出来
                            let old = {}
                            if(this.state.detailinfo){
                                old = this.state.detailinfo
                            }
                            old[detailinfo.taskid] = detailinfo.itemlist
                            that.setState({
                                detailinfo : old
                            })
                        
                            this._saveData(detailinfo.username,'listdetail'+detailinfo.taskid,detailinfo,'持久化任务里面的明细');
                        }else if(dataArr[0] === 'offlinelistdetail') {
                            console.log("get offline listdetail info")
                            let username = dataArr[1]
                            let taskid = dataArr[2]
                            that._loadData(
                                username,
                                'listdetail'+taskid,
                                (ret)=>{
                                    console.log('任务详情:')
                                    console.log(ret);
                                    that.refs.webViewRef.postMessage('offlinelistdetail:'+JSON.stringify(ret))
                                },
                                (err)=>{
                                    console.log('fail')
                                    that.refs.webViewRef.postMessage("offlinelistdetail:fail")
                                }
                            )
                        }else if(dataArr[0] === 'offlinedtask') {
                            // 主动离线 这里是存储的离线的任务的id 读取的时候根据这个id去读取离线任务
                            console.log(' add new offlined task message')
                            let info = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            info = JSON.parse(info)
                            console.log(info)
                            // 逻辑 -> 查询已经离线的 ->把新离线的添加进去 load->modify->save
                            // 查询不到已有的 -> 走catch路线 ->添加 ->save
                            that._loadData(
                                info.username,
                                'offlinedtask',
                                (ret)=>{
                                    // console.log('目前已经离线的为')
                                    // console.log(ret)
                                    // 把离线的任务id添加进去 
                                    ret[info.taskid] = true
                                    that._saveData(info.username,'offlinedtask',ret)
                                    that._downloadData(info.taskid)
                                },
                                (err)=>{
                                    console.log('目前没有离线任务')
                                    let temp = {}
                                    temp[info.taskid] = true
                                    // console.log(temp)
                                    that._saveData(info.username,'offlinedtask',temp)
                                    that._downloadData(info.taskid)
                                }
                            )
                        }else if(dataArr[0] === 'checkPost') {
                            // 查询是否有离线签名
                            // that.refs.webViewRef.postMessage("offlinePost:yes")
                            let taskid = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            console.log('查询任务：'+taskid+'是否有离线')
                            that._loadData(
                                that.state.loginName,
                                'offlinedtask',
                                (ret)=>{
                                    console.log('已离线的为 ')
                                    console.log(ret)
                                    if(ret[taskid]){
                                        that.refs.webViewRef.postMessage('offlinePost'+taskid+':yes')
                                    }else{
                                        that.refs.webViewRef.postMessage('offlinePost'+taskid+':no')
                                    }
                                },
                                (err)=>{
                                    that.refs.webViewRef.postMessage('offlinePost'+taskid+':no')
                                }
                            )

                            // storage.getAllDataForKey(that.state.userId+':offlinepost:'+taskid).then(ret => {
                            //     console.log('task:'+taskid+'下的签名')
                            //     console.log(ret);
                            //     if(ret.length===0){
                            //         storage.getAllDataForKey(that.state.userId+':offlineinput:'+taskid).then(ret2 => {
                            //             console.log('task:'+taskid+'下的Input')
                            //             console.log(ret2);
                            //             if(ret2.length === 0){
                            //                 that.refs.webViewRef.postMessage('offlinePost'+taskid+':no')
                            //             }else{
                            //                 that.refs.webViewRef.postMessage('offlinePost'+taskid+':yes')
                            //             }
                            //         }).catch(err2=>{
                            //             that.refs.webViewRef.postMessage('offlinePost'+taskid+':no')
                            //         })
                            //     }else{
                            //         that.refs.webViewRef.postMessage('offlinePost'+taskid+':yes')
                            //     }
                                
                            // }).catch(err =>{
                            //     console.log(err)
                            //     that.refs.webViewRef.postMessage('offlinePost'+taskid+':no')
                            // })
                      
                        }else if(dataArr[0] === 'doPost') {
                            console.log('上传离线签名数据')
                            let taskid = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            let times = 0;
                            // console.log(that.state.userId)
                            // console.log(taskid)

                            // 清除相关离线数据
                            that._loadData(
                                that.state.loginName,
                                'offlinedtask',
                                (ret)=>{
                                    if(ret[taskid]){
                                        delete ret[taskid]
                                    }
                                    that._saveData(that.state.loginName,'offlinetask',ret,'上传后现在已离线的任务为')
                                },
                                (err)=>{
                                    console.log('找不到任务？怎么回事那你怎么上传的？')
                                }
                            )
                            



                            storage.getAllDataForKey(that.state.userId+':offlinepost:'+taskid).then(ret => {
                                console.log('task:'+taskid+'下的签名')
                                console.log(ret);
                                if(ret.length===0){
                                    that.refs.webViewRef.postMessage('doPostFinish'+taskid+':0:0')
                                }
                                for(let i=0;i<ret.length;i++){
                                    axios.post( that.state.url + '/xmis/AirlineTaskAction/signJcData.do', ret[i]).then(response => {
                                        console.log("同步离线签名")
                                        console.log(response)
                                        // 记录成功上传的次数
                                        if(response.data.result === 'success'){
                                            times++
                                        }
                                        if(i===ret.length-1){
                                            that.refs.webViewRef.postMessage('doPostFinish'+taskid+':'+(i+1)+':'+(times))
                                        }
                                        console.log({
                                            i:i,
                                            times:times,
                                            length:ret.length
                                        })
                                    }).catch(err =>{
                                        console.log(err)
                                        if(i===ret.length-1){
                                            that.refs.webViewRef.postMessage('doPostFinish'+taskid+':'+(i+1)+':'+(times))
                                            that._removeDownloaded(that.state.userId,taskid)
                                        }
                                    })
                                    // let d = await axios.post('http://wechattest.ameco.com.cn:8090/xmis/AirlineTaskAction/signJcData.do', ret[i])
                                    // console.log(d)
                                }
                                
                                // 清除已经发送的数据
                                storage.clearMapForKey(that.state.userId+':offlinepost:'+taskid)
                            }).catch(err =>{
                                console.log(err)
                                that.refs.webViewRef.postMessage('doPostFinish'+taskid+':'+(0)+':'+(0))
                            })
                            // 输入框
                            storage.getAllDataForKey(that.state.userId+':offlineinput:'+taskid).then(ret => {
                                console.log(ret);
                                if(ret.length===0){
                                    // that.refs.webViewRef.postMessage('doPostFinish:0:0')
                                    console.log('没有离线input需要上传')
                                }
                                for(let i=0;i<ret.length;i++){
                                    let par = '?jcid='+ret[i].jcid+'&dbid='+ret[i].dbid+'&value='+ret[i].value+'&userid='+ret[i].userid;
                                    if(ret[i].validator!=undefined){
                                        par+='&validator='+ret[i].validator
                                    }
                                    if(ret[i].inputvalueopt!=undefined){
                                        par+='&inputvalueopt='+ret[i].inputvalueopt
                                    }
                                    console.log('参数为'+par)
                                    axios.post( that.state.url + '/xmis/LMJcAction/SaveJcHtmlInputValue.do'+par).then(res=>{
                                        console.log(res.data)
                                    }).catch(err=>{
                                        console.log('errrrrrrrrrrrrrrr')
                                        console.log(err)
                                    })
                                }
                                // 清除已经发送的数据
                                storage.clearMapForKey(that.state.userId+':offlineinput:'+taskid)
                            }).catch(err =>{
                                console.log(err)
                                // that.refs.webViewRef.postMessage('doPostFinish:'+(0)+':'+(0))
                            })

                            
                        }else if(dataArr[0] === 'download') {
                            let info = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            console.log('下载离线数据:'+info)
                            info = JSON.parse(info)
                            // 这里的info是单个待完成任务的数据
                            let taskid = info.layoverJcId
                            // 把任务缓存起来
                            that._saveData(this.state.userId,info.layoverJcId,info)
                            setTimeout(()=>{
                                that.refs.webViewRef.postMessage("downloadFinish:yes")
                            },1000)
                        }else if(dataArr[0] === 'updateCurrentTaskid') {
                            // 更新记录当前操作的哪个task   值 taskId
                            let taskId = msg.nativeEvent.data.substring(dataArr[0].length+1);
                            console.log('更新taskId:'+taskId)
                            that.setState({
                                taskId: taskId
                            })
                        }
                    }}
                    onError={() => { alert('系统初始化失败！') }}
                />
                <Modal style={styles.base}
                       visible={this.state.modalVisible}
                       transparent={false}
                       onRequestClose={() => {
                           console.log('Modal has been closed.');
                       }}>
                    <Image
                        style={{
                            width: global.gScreen.width,
                            height: global.gScreen.height-100,
                            resizeMode: 'contain',
                        }}
                        source={{
                            uri: this.state.images
                        }}
                    />
                    <View style={styles.btns}>
                        <TouchableHighlight style={styles.btn}
                                            onPress={() => {
                                                this.upLoadImage()
                                            }}>
                            <Text>上传</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.btn}
                                            onPress={() => {
                                                this.setModalVisible(!this.state.modalVisible)
                                            }}>
                            <Text>关闭</Text>
                        </TouchableHighlight>
                    </View>
                </Modal>
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
    btns:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop:20
    },
    btn:{
        width:60,
        height:30,
        borderColor: '#000000',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems:'center',
        borderRadius:3,
        marginRight:20,
    },
})

export default HomeContainer
