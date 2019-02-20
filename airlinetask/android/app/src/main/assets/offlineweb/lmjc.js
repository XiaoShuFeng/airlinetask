(function($){
	
	var loadSvg = '<div name="signsvg"> <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
    ' width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">' +
    '<path opacity="0.2" fill="#F00" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946' +
    '   s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634' +
    '   c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>' +
    ' <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0' +
    '   C22.32,8.481,24.301,9.057,26.013,10.047z">' +
    '   <animateTransform attributeType="xml"' +
    '     attributeName="transform"' +
    '     type="rotate"' +
    '     from="0 20 20"' +
    '     to="360 20 20"' +
    '     dur="0.5s"' +
    '     repeatCount="indefinite"/>' +
    '   </path>' +
    '</svg> </div>' ;
	
	function parseOptions(target, properties){
		var t = $(target);
		var options = {};
		if (properties){
			var opts = {};
			for(var i=0; i<properties.length; i++){
				var pp = properties[i];
				if (typeof pp == 'string'){
					opts[pp] = t.attr(pp);
				} else {
					for(var name in pp){							
						var type = pp[name];
						if (type == 'boolean'){
							opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
						} else if (type == 'number'){
							opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
						}
					}
				}			
			}
			$.extend(options, opts);
		}
		return options;	
	};
	
	/*--输入域--*/


	
	
	function createInputUnit(target){
		var opts = $.data(target, 'inputunit').options;
		var inputctrl = opts.inputcontrol;
		if(inputctrl === '3') {//checkbox
			createCheckBox(target);
		}else if(inputctrl === '5'){//text
			createTextBox(target);
		}else if(inputctrl === '23'){//select
			createSelectBox(target);
		}
	};
	
	function createSelectBox (target) {
		var opts = $.data(target, 'inputunit').options;
		var selectBox = $('<select width="25px" ' + (opts.enable==='0'?'disabled':'') +  '></select>').appendTo($(target));
		var selectArr;
		if(opts.inputvalueopt != null){
		   $('<option></option>').appendTo($(selectBox));
		   selectArr = opts.inputvalueopt.split(',');
		}
		$.each(selectArr,function(index,val){
			$('<option>' + val + '</option>').appendTo($(selectBox));
		});
		$(selectBox).on('change', function(){
			var val = $(this).children('option:selected').val();
			opts.value = val;
			$.data(target, 'inputunit').options = opts;
			opts.onSave.call(this,target, opts.dbid, val);
		});			
		$.extend(opts, {control: selectBox});
		$.data(target, 'inputunit').options = opts;
	};
	
	
	function createCheckBox(target) {
		var opts = $.data(target, 'inputunit').options;
		var checkBox = $('<input type="checkbox" '+(opts.value=='1'?'checked':'') + ' ' +(opts.enable==='0'?'disabled':'')+'/>').appendTo($(target));
		$(checkBox).on('change', function(){
			var val = $(this).prop('checked')==true?'1':'0';
			opts.value = val;
			$.data(target, 'inputunit').options = opts;
			opts.onSave.call(this,target, opts.dbid, val);
		});
		$.extend(opts, {control: checkBox});
		$.data(target, 'inputunit').options = opts;
	};
	
	function createTextBox(target) {
		var opts = $.data(target, 'inputunit').options;
		var textBox = $('<input type="text" value="'+(opts.value?opts.value:'')+'" ' +(opts.enable==='0'?'disabled':'')+ ' />').appendTo($(target));

		//var contextText = '';
		//$(target).find('font').each(function(){
		//	contextText += $(this).context.innerText;
		//});
		//textBox.css('width', contextText.length*6 + 'px');
		
		$(textBox).on('change', function(){
			opts.value = $(this).val();
			$.data(target, 'inputunit').options = opts;
			opts.onSave.call(this,target, opts.dbid, $(this).val());
		});
		$.extend(opts, {control: textBox});
		$.data(target, 'inputunit').options = opts;
	};
	
	function setInputUnitValue(target, val) {
		var opts = $.data(target, 'inputunit').options;
		if(opts.inputcontrol === '5') {
			$(opts.control).val(val);
			opts.value = val;
		} else if(opts.inputcontrol === '3') {
			if(val === '1') {
				$(opts.control).prop('checked','true');
			} else {
				$(opts.control).removeAttr("checked");
			}
		} else if(opts.inputcontrol === '23'){
			$(opts.control).val(val);
			opts.value = val;		
		}
		$.data(target, 'inputunit').options = opts;
	};
	
	function getInputUnitValue(target) {
		var opts = $.data(target, 'inputunit').options;
		if(opts.inputcontrol === '5') {
			return opts.value;
		} else if(opts.inputcontrol === '3') {
			var attr = $(opts.inputcontrol).attr('checked');
			if (typeof attr !== typeof undefined && attr !== false) {
				return 1;
			}else{
				return 0;
			}
		}
	};
	
	function bindEvents(target) {
		var opts = $.data(target, 'inputunit').options;
		opts.onLoad.call(this, target, opts.dbid);
	};
	
	function setModifyValue(target, val) {
		var opts = $.data(target, 'inputunit').options;
		if(opts.inputcontrol === '5') {
			var modifyvalue = '<font class="modifyvalue" style="display:inline-block;">' + val + '<font/>';
			$(modifyvalue).insertBefore($(opts.control));
			//$(opts.control).css('width', ($(opts.control).width - modifyvalue.width) + 'pt');

		}
	};
	
	$.fn.inputunit = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.inputunit.methods[options];
			if (method){
				return method(this, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'inputunit');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'inputunit', {
					options: $.extend({}, $.fn.inputunit.defaults, $.fn.inputunit.parseOptions(this), options)
				});
			}
			createInputUnit(this);
			bindEvents(this);
		});
	};
	
	$.fn.inputunit.methods = {
		options: function(jq){
			return $.data(jq[0], 'inputunit').options;
		},
		getValue: function(jq) {
			return getInputUnitValue(jq[0]);
		},
		setValue: function(jq, val) {
			return setInputUnitValue(jq[0], val);
		},
		setModifyValue:function(jq,val){
			return setModifyValue(jq[0], val);
		}
	};
	
	$.fn.inputunit.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, parseOptions(target, 
			['dbid','inputcontrol','value','inputvalueopt','enable','validator']
		));
	};
		
	$.fn.inputunit.defaults = {
		dbid: null,
		inputcontrol: null,
		value: null,
		inputvalueopt: null,
		enable:'1',//是否可以进行编辑 0:不能 1:能
		validator:null,
		onLoad: function(el,dbid){},
		onSave: function(dbid, value){}
	};
	
	
	/*--签署按钮--*/
	
	function createSignButton(target){
		var opts = $.data(target, 'signbutton').options;
		var signButton = $('<input type="button" name="signbutton" value="点击签署"  style="' +(opts.esign==='0'?'display:none;':'')+ '"  />').appendTo($(target));
		signButton.attr('signid',opts.signid);
		
		if(opts.displayCheck && opts.esign === '1'){
			var checkBox = $('<input type="checkbox"/>').appendTo($(target));

			$(checkBox).on('click',function(){
				var val = $(this).prop('checked')==true?'1':'0';
				if(val === '1'){
					$(signButton).css('background','#008040');
					$(signButton).css('border-color','#008040');
					$(signButton).attr('value','点击批签');
					$(target).attr('batchsign','true');
					opts.isChecked = true;
				}else{
					$(signButton).css('background','');
					$(signButton).css('border-color','');
					$(signButton).attr('value','点击签署');
					$(target).attr('batchsign','');
					opts.isChecked = false;
				}
			})
		}
			
		
		$(signButton).on('click', function(){
			console.log(opts);
			opts.onClick.call(this,target,opts.signid, opts.posid);
		});
		$.extend(opts, {control: signButton});
		$.data(target, 'signbutton').options = opts;
	}
	
	
	
	function bindSignButtonEvents(target) {
		var opts = $.data(target, 'signbutton').options;
		opts.onLoad.call(this, target, opts.signid);
	};
	
	$.fn.signbutton = function(options, parma){
		if (typeof options == 'string'){
			var method = $.fn.signbutton.methods[options];
			if (method){
				return method(this, parma);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'signbutton');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'signbutton', {
					options: $.extend({}, $.fn.signbutton.defaults, $.fn.signbutton.parseOptions(this), options)
				});
			}
			createSignButton(this);
			bindSignButtonEvents(this);
		});
	};
	
	
	$.fn.signbutton.methods = {
		options: function(jq){
			return $.data(jq[0], 'signbutton').options;
		},
		setValue: function(jq, parma) {
			var opts = $.data(jq[0], 'signbutton').options;
			console.log(parma);
			opts.posid = parma;
			$.data(jq[0], 'signbutton').options = opts;
			return;
		},
		initValue: function(jq, signid,posid) {
			var opts = $.data(jq[0], 'signbutton').options;
			opts.posid = posid;
			opts.signid = signid;
			$.data(jq[0], 'signbutton').options = opts;
			return;
		},
		signSuccess: function(jq, base64) {			
			return signSuccess(jq[0], base64);
		},
		signDelete: function(jq) {			
			return signDelete(jq[0]);
		},
		signDisplay: function(jq,isShow) {			
			return signDisplay(jq[0],isShow);
		}
	};
	
	function signDisplay(target,isShow){
		if(!isShow){
	        $(loadSvg).prependTo($(target));
			$(target).find('input').css('display', 'none');
			$(target).find('img').css('display', 'none');
		}else{
			$(target).find('div[name=signsvg]').remove();
			$(target).find('input').css('display', 'inline-block');
			$(target).find('img').css('display', 'inline-block');
		}
		
		// location.reload()
	}
	
	
	function signSuccess(target,base64){
		var opts = $.data(target, 'signbutton').options;		
		var signImg = $('<img src= "data:image/png;base64,' + base64 +  '"/>');
		
		var button = $(target).find('input[name = "signbutton"]');
		if(button.length > 0 ){
			$(target).find('input[name = "signbutton"]').replaceWith($(signImg));		
			$(target).find('input[type = "checkbox"]').remove();
		}else{
			$(target).find('img').replaceWith($(signImg));
		}
		
		if(opts.esign === '1'){
			$(signImg).on('click', function(){
				opts.onImgClick.call(this,target);
			});
		}
		$(target).attr('batchsign','false');

		signDisplay(target,true);
		
		$.data(target, 'signbutton').options = opts;
	}
	
	function signDelete(target){
		// alert('delete')		
		var img = $(target).find('img').remove();
		createSignButton(target);
		signDisplay(target,true);
	}
	
	$.fn.signbutton.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, parseOptions(target, 
			['signid','posid','displayCheck','isChecked','esign']
		));
	};
		
	$.fn.signbutton.defaults = {
		signid: null, //签署id 或jcid
		posid: null,  //工序id 或 'jcid'字符串
		displayCheck:false, //是否显示checkbox默认不显示
		isChecked:false,//是否选中
		esign:'0', //判断当前是预览还是签署状态
		onLoad: function(el,signid){}, //加载数据,根据此id去服务器查找对应的签署是否有值,若有则显示对应的签署图片;否则显示button控件并赋值posid
		onClick: function(target,signid, posid){},//验证签名
		onImgClick: function(target){}//点击签名图片
	};
	
})(jQuery);

(function($,window,document){

 	var pluginName = 'dialogBox',
 		defaults = {

 			width: null, //弹出层宽度
 			height: null,  //弹出层高度
 			autoSize: true,  //是否自适应尺寸,默认自适应
 			autoHide: false,  //是否自自动消失，配合time参数共用
 			time: 3000,  //自动消失时间，单位毫秒
 			zIndex: 99999,  //弹出层定位层级
 			hasMask: false,  //是否显示遮罩层
 			hasClose: false,  //是否显示关闭按钮
 			hasBtn: false,  //是否显示操作按钮，如取消，确定
 			confirmValue: null,  //确定按钮文字内容
 			confirm: function(){}, //点击确定后回调函数
 			cancelValue: null,  //取消按钮文字内容
 			cancel: function(){},  //点击取消后回调函数，默认关闭弹出框
 			effect: '', //动画效果：fade(默认),newspaper,fall,scaled,flip-horizontal,flip-vertical,sign,
 			type: 'normal', //对话框类型：normal(普通对话框),correct(正确/操作成功对话框),error(错误/警告对话框)
 			title: '',  //标题内容，如果不设置，则连同关闭按钮（不论设置显示与否）都不显示标题
 			content: ''  //正文内容，可以为纯字符串，html标签字符串，以及URL地址，当content为URL地址时，将内嵌目标页面的iframe。

 		};

 	function DialogBox(element,options){
 		this.element = element;
 		this.settings = $.extend({}, defaults, options);
 		this.init();		
 	}
	
 	DialogBox.prototype = {	

 		//初始化弹出框
 		init: function(){
 			var that = this,
 				element = this.element;
 				
 			that.render(element);
 			that.setStyle();
 			that.show();
 			that.trigger(element);
 		},

 		//创建弹出框
 		create: function(element){
 			var that = this,
 				$this = $(element),
 				title =  that.settings.title,
 				hasBtn = that.settings.hasBtn,
 				hasMask = that.settings.hasMask,
 				hasClose = that.settings.hasClose,
 				confirmValue = that.settings.confirmValue,
 				cancelValue = that.settings.cancelValue,
 				dialogHTML = [];


 			if(!title){
 				dialogHTML[0] = '<section class="dialog-box"><div class="dialog-box-container"><div class="dialog-box-content"></div>';			
 			}else{
 				if(!hasClose){
					dialogHTML[0] = '<section class="dialog-box"><div class="dialog-box-container"><div class="dialog-box-title"><h3>'+ title + '</h3></div><div class="dialog-box-content"></div>';
 				}else{					
 					dialogHTML[0] = '<section class="dialog-box"><div class="dialog-box-container"><div class="dialog-box-title"><h3>'+ title + '</h3><span class="dialog-box-close">×</span></div><div class="dialog-box-content"></div>';
 				}
 			}

 			if(!hasBtn){
 				dialogHTML[1] = '</div></section>';
 			}else{
 				if(confirmValue && cancelValue){
 					dialogHTML[1] = '<div class="dialog-btn"><span class="dialog-btn-cancel">' + cancelValue + '</span><span class="dialog-btn-confirm">' + confirmValue + '</span></div></div></section>';
 				}else if(cancelValue){
 					dialogHTML[1] = '<div class="dialog-btn"><span class="dialog-btn-cancel">' + cancelValue + '</span></div></div></section>';
 				}else if(confirmValue){
 					dialogHTML[1] = '<div class="dialog-btn"><span class="dialog-btn-confirm">' + confirmValue + '</span></div></div></section>';
 				}else{
 					dialogHTML[1] = '<div class="dialog-btn"><span class="dialog-btn-cancel">取消</span><span class="dialog-btn-confirm">确定</span></div></div></section>';
 				}
 			}

 			if(!hasMask){
 				dialogHTML[2] = '';
 			}else{
 				dialogHTML[2] = '<div id="dialog-box-mask"></div>';
 			}

 			return dialogHTML;	
 		},

 		//渲染弹出框
 		render: function(element){
 			var that = this,
 				$this = $(element),
 				dialogHTML = that.create($this),
 				$content = that.parseContent();
 				
 			$this.replaceWith(dialogHTML[0] + dialogHTML[1]);

 			if(typeof($content) === 'object'){
 				$content.appendTo('.dialog-box-content');
 			}else{
 				$('.dialog-box-content').append($content);
 			}
 			
 			$('body').append(dialogHTML[2]);
 		},

 		//解析并处理弹出框内容
 		parseContent: function(){
 			var that = this,
 				content = that.settings.content,
 				width = that.settings.width,
 				height = that.settings.height,
 				type = that.settings.type,
 				$iframe = $('<iframe>'),
 				random = '?tmp=' + Math.random(),
 				urlReg = /^(https?:\/\/|\/|\.\/|\.\.\/)/;

 			if(urlReg.test(content)){

 				$iframe.attr({
 					src: content + random,
 					frameborder: 'no',
 					scrolling: 'no',
 					name: 'dialog-box-iframe',
 					id: 'dialog-box-iframe'
 				})
 				.on('load',function(){

 					//动态自适应iframe高度;
 					var $iframe = $(window.frames['dialog-box-iframe'].document),
 						$iframeBody = $(window.frames['dialog-box-iframe'].document.body),
 						iframeWidth = $iframe.outerWidth() - 8,
 						iframeHeight = $iframe.outerHeight() - 16,
 						$dialogBox = $('.dialog-box'),
 						$content = $('.dialog-box-content'),
 						$container = $('.dialog-box-container');

 						dialogBoxWidth = iframeWidth + 40;
 						dialogBoxHeight = iframeHeight + 126;
 						
 					if(that.settings.autoSize){	
 						$(this).width(iframeWidth);
 						$(this).height(iframeHeight);

 						$iframeBody.css({
 							margin: '0',
 							padding: '0'
 						});

 						$content.css({
 							width: iframeWidth + 'px',
 							height: iframeHeight + 'px'
 						});

 						$container.css({
 							width: dialogBoxWidth + 'px',
 							height: dialogBoxHeight + 'px'
 						});

 						$dialogBox.css({
 							width: dialogBoxWidth,
 							height: function(){
 								if(type === '' || type === 'normal'){
 									return dialogBoxHeight + 'px';
 								}else if(type === 'error' || type === 'correct'){
 									dialogBoxHeight = dialogBoxHeight + 8;
 									return dialogBoxHeight + 'px';
 								}	
 							},
 							'margin-top': function(){
 								if(type === '' || type === 'normal'){
 									return -Math.round(dialogBoxHeight/2) + 'px';
 								}else if(type === 'error' || type === 'correct'){
 									dialogBoxHeight = dialogBoxHeight + 4;
 									return -Math.round(dialogBoxHeight/2) + 'px';
 								}	
 							},
 							'margin-left': -Math.round(dialogBoxWidth/2) + 'px'
 						});

 					}else{
 						$(this).width(that.settings.width - 40);
 						$(this).height(that.settings.height - 126);
 					}
 				});
				return $iframe;
 			}else{
 				return content;
 			}
 		},

 		//显示弹出框
 		show: function(){
 			$('.dialog-box').css({display:'block'});

 			setTimeout(function(){
 				$('.dialog-box').addClass('show');
 			},50)

 			$('#dialog-box-mask').show();
 		},

 		//隐藏弹出框
 		hide: function(element){
 			var $this = $(element),
 				$dialogBox = $('.dialog-box'),
 				$iframe = $('#dialogBox-box-iframe');

 			$dialogBox.removeClass('show');

 			setTimeout(function(){
 				if($iframe){
 					$iframe.attr('src','_blank');
 				}

 				$dialogBox.replaceWith('<div id="' + $this.attr('id') + '"></div/>');
 				$('#dialog-box-mask').remove();
 			},150)
 		},

 		//设置弹出框样式
 		setStyle: function(){
 			var that = this,
 				$dialog = $('.dialog-box'),
 				$container = $('.dialog-box-container'),
 				$content = $('.dialog-box-content'),
 				$mask  = $('#dialog-box-mask'),
 				type = that.settings.type,
 				EFFECT = 'effect';

 			//弹出框外框样式
 			$dialog.css({
 				width: function(){
 					if(that.settings.width){
 						return that.settings.width + 'px';
 					}else{
 						return;
 					}
 				},
 				height: function(){
 					if(that.settings.height){
 						if(type === '' || type === 'normal'){
 							return that.settings.height + 'px';
 						}else if(type === 'error' || type === 'correct'){
 							return that.settings.height + 4 + 'px';
 						}
 					}else{
 						return;
 					}
 				},
 				'margin-top': function(){
 					var height;
 					if(type === '' || type === 'normal'){
 						height = that.settings.height;
 					}else if(type === 'error' || type === 'correct'){
 						height = that.settings.height + 4;
 					}
 					return -Math.round(height/2) + 'px';
 				},
 				'margin-left': function(){
 					var width = $(this).width();
 					return -Math.round(width/2) + 'px';
 				},
 				'z-index': '99999999999999'
 			});

 			//弹出框内层容器样式
 			$container.css({
 				width: function(){
 					if(that.settings.width){
						return that.settings.width + 'px';
 					}else{
 						return;
 					}
 				},
 				height: function(){
 					if(that.settings.height){
 						return that.settings.height + 'px';
 					}else{
 						return;
 					}
 				},
 			});

 			//弹出框内容样式
 			$content.css({
 				width: function(){
 					if(that.settings.width){
 						return that.settings.width - 40 + 'px';
 					}else{
 						return;
 					}
 				},
 				height: function(){
 					if(that.settings.height){
 						return that.settings.height - 126 + 'px';
 					}else{
 						return;
 					}
 				}
 			});

 			//遮罩层样式
 			$mask.css({
 				height: $(document).height() + 'px',
 				width: $(document).width() + 'px'
 			});
 		

 			//判断弹出框类型
 			switch(that.settings.type){
 				case 'correct':
 					$container.addClass('correct');
 					break;
 				case 'error':
 					$container.addClass('error');
 					break;
 				default:
 					$container.addClass('normal');;
 					break;
 			}

 			//弹出框多种动画效果
 			switch(that.settings.effect){
 				case 'newspaper':
 					$dialog.addClass(EFFECT + '-newspaper');
 					break;
 				case 'fall':
 					$dialog.addClass(EFFECT + '-fall');
 					break;
 				case 'scaled':
 					$dialog.addClass(EFFECT + '-scaled');
 					break;
 				case 'flip-horizontal':
 					$dialog.addClass(EFFECT + '-flip-horizontal');
 					break;
 				case 'flip-vertical':
 					$dialog.addClass(EFFECT + '-flip-vertical');
 					break;
 				case 'sign':
 					$dialog.addClass(EFFECT + '-sign');
 					break;
 				default:
 					$dialog.addClass(EFFECT + '-fade');
 					break;
 			}

 		},

 		//弹出框触屏器(系列事件)
 		trigger: function(element,event){
 			var that = this,
 				$this = $(element);

 			$('.dialog-box-close,#dialog-box-mask,.dialog-btn-cancel,.dialog-btn-confirm').on('click',function(){
 				that.hide($this);
 			});

 			$(document).keyup(function(event){
 				if(event.keyCode === 27){
 					that.hide($this);
 				}
 			});

 			if(that.settings.autoHide){
 				setTimeout(function(){
 					that.hide($this);
 				},that.settings.time)
 			}

 			if($.isFunction(that.settings.confirm)){
 				$('.dialog-btn-confirm').on('click',function(){
 					that.settings.confirm();
 				})
 			}

 			if($.isFunction(that.settings.cancel)){
 				$('.dialog-btn-cancel').on('click',function(){
 					that.settings.cancel();
 				})
 			}

 		}

 	};

 	$.fn[pluginName] = function(options) {
        this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new DialogBox(this, options));			
			}
        });
		return this;
    };
	
 })(jQuery,window,document);

$(function(){

   
	
	/*字号缩放计算rem基准值处理,此处备用
	 * setTimeout(function(){ 
		var d = document.createElement('div');
		d.style.cssText="width:1rem;height:0;overflow: hidden;position:absolute;z-index:-1;visibility: hidden;";
		document.body.appendChild(d);
		var dw=d.offsetWidth; 
		document.body.removeChild(d);
		var fz = 16; 
		var realRem = fz;
		if(dw != fz){
			//如果用户设置的系统字号不是标准的16px
			realRem = Math.pow(fz , 2) / dw;
			var fontEl = document.createElement('style');
			fontEl.innerHTML = 'html{font-size:' + Math.floor(realRem) + 'px!important;}';
			var docEl = document.documentElement;
			docEl.firstElementChild.appendChild(fontEl);
			//docEl.style.fontSize = Math.floor(realRem) + 'px!important';
		}				
		
	} , 0);

		*/
	//加载时打开遮罩层
	var loading = function() {
		// if($('#overlay').length == 0) {
	 //        // add the overlay with loading image to the page
	 //        var over = '<div id="overlay">' +
	 //            '<svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
		// 	       ' width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">' +
		// 	       '<path opacity="0.2" fill="#F00" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946' +
		// 	       '   s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634' +
		// 	       '   c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>' +
		// 	       ' <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0' +
		// 	       '   C22.32,8.481,24.301,9.057,26.013,10.047z">' +
		// 	       '   <animateTransform attributeType="xml"' +
		// 	       '     attributeName="transform"' +
		// 	       '     type="rotate"' +
		// 	       '     from="0 20 20"' +
		// 	       '     to="360 20 20"' +
		// 	       '     dur="0.5s"' +
		// 	       '     repeatCount="indefinite"/>' +
		// 	       '   </path>' +
		// 	    '</svg>' +
	 //           '</div>';
	 //        $(over).prependTo('body');
		// }
		// $('body').addClass('noscroll');
		// $('#overlay').show();
		// $('#overlay').css({
		// 	height: $(document).height() + 'px',
		// 	width: $(document).width() + 'px'
		// });
		// $('body').on('touchmove', function (event) {
		//     event.preventDefault();
		// });
    };
    
    //关闭加载遮罩层
    var endLoading = function(){
    	$('body').off('touchmove');
    	$('body').removeClass('noscroll');
    	$('#overlay').hide();
    };
    
	if(!JcId || JcId === 'undefined') {
		maskDialog('未知的工卡');
	}else{
		
		var userid = '';
		//判断当前是否可以点击
		clickEnable = true;
		
		loading();
		/*--对话框定义--start*/
		$('<div id="dialog"/>').prependTo('body');
		//普通提示框
		var maskDialog = function(message) {
			$('#dialog').dialogBox({
				hasClose : true,
				hasMask : true,
				title : '提示',
				content : message
			});
		}

		//签署撤销提示框
		var signModifyDialog = function(target, firstid, secondid,location) {

			$('#dialog').dialogBox({
				hasMask : true,
				hasClose : true,
				hasBtn : true,
				width: '400',
				height: '200',
				confirmValue : '修改签署',
				confirm : function() {					
					openEsign('modifyesign', firstid, secondid,location);
				},
				cancelValue : '删除签署',
				cancel : function() {
					let data = possigndata[location];
					if(!data.fromoffline){
						try{
							// alert('无法删除离线前的签名')
							setTimeout(function(){
								maskDialog('无法删除离线前已有签名');
							},500)
							
							return;
						}catch(e){
							alert(e.message)
						}
						// alert('no')
						
					}
					openEsign('offlinedeleteesign', firstid, secondid,location);
				},
				title : '撤销签署',
				content : '请选择修改方式'
			});
		}
		/*--对话框定义--end*/
		
		/*--计算input text的宽度--start*/
		$('<font id ="ruler"/>').prependTo('body');
		
    	
        String.prototype.visualLength = function(size,family)
        {
            var ruler = $("#ruler").css({
                "font-size":size || "inherit",
                "font-family":family || "inherit"
            });
            ruler.text(this);
            return ruler.width();
        }
        		
		/*--计算input text的宽度--end*/
		
		
        
        
        
		//加载工卡信息
		// $.ajax({
		// 	type:'post',
		// 	dataType:'json',
		// 	url:"http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcInfo.do",
		// 	data:{"jcid":JcId},
		// 	success:function(data){
		// 		$('td[name="acreg"]').find('font')[0].innerText = data.acreg;
		// 		$('td[name="flightno"]').find('font')[0].innerText = data.flightno;
		// 		$('td[name="mainStation"]').find('font')[0].innerText = data.airport;
		// 		$('td[name="actype"]').find('font')[0].innerText = data.actype;
		// 	}
			
		// });
		try{
			$('td[name="acreg"]').find('font')[0].innerText = jcinfo.acreg;
			$('td[name="flightno"]').find('font')[0].innerText = jcinfo.flightno;
			$('td[name="mainStation"]').find('font')[0].innerText = jcinfo.airport;
			$('td[name="actype"]').find('font')[0].innerText = jcinfo.actype;
		}catch(e){
			// 这里有一个对象是undefined  ↑
			//alert(e.message)
		}
		
		
		//获取输入控件值,并设置部分样式
		var GetJcHtmlInputValue = function(el, dbid){

			// $.ajax({
			// 	type:'post',
			// 	dataType:'json',
			// 	url:"http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcHtmlInputValue.do",
			// 	data:{"jcid":JcId,"dbid":dbid},
			// 	success:function(data){
			// 		$(el).inputunit('setValue', data.value);
			// 		//留痕处理
			// 		if(!isEmpty(data.modifyvalue)){
			// 			$(el).inputunit('setModifyValue', data.modifyvalue);							
			// 		}
			// 		//设置文本框宽度
			// 		if($(el).attr('inputcontrol') === '5'){
			// 			var contextText = '';
			// 			var cssText = '';
			// 			var fontFamily = 'Times New Roman';
			// 			$(el).find('font[class!="modifyvalue"]').each(function(){
			// 				contextText += $(this).context.innerText;
			// 				cssText = $(this)[0].style.cssText;
			// 				fontFamily = $($(this)[0]).css("font-family");
			// 			});
			// 			if(contextText.indexOf("_") >= 0 || cssText.indexOf("text-decoration") >= 0){
			// 				//设置下划线border
			// 				$(el).find('input[type="text"]').css('border-bottom', '1px solid #000000');
			// 			}
							
			// 			var len = contextText.visualLength("10.5",fontFamily);
			// 			var modifyvalue = $(el).find('font[class="modifyvalue"]');
			// 			if(modifyvalue.length > 0){
			// 				len = len - modifyvalue.context.innerText.visualLength("10.5pt",fontFamily);
			// 			}
						
			// 			$(el).find('input[type="text"]').css('width', len  + 'pt');
			// 			//$(el).find('input[type="text"]').css('width', (len -2)/12 + 'rem');
			// 		}
			// 	}
			// });
					// alert('눈_눈')
					let data = inputs[dbid]
					// alert(JSON.stringify(data))
					$(el).inputunit('setValue', data.value);
					//留痕处理
					if(!isEmpty(data.modifyvalue)){
						$(el).inputunit('setModifyValue', data.modifyvalue);							
					}
					//设置文本框宽度
					if($(el).attr('inputcontrol') === '5'){
						var contextText = '';
						var cssText = '';
						var fontFamily = 'Times New Roman';
						$(el).find('font[class!="modifyvalue"]').each(function(){
							contextText += $(this).context.innerText;
							cssText = $(this)[0].style.cssText;
							fontFamily = $($(this)[0]).css("font-family");
						});
						if(contextText.indexOf("_") >= 0 || cssText.indexOf("text-decoration") >= 0){
							//设置下划线border
							$(el).find('input[type="text"]').css('border-bottom', '1px solid #000000');
						}
							
						var len = contextText.visualLength("10.5",fontFamily);
						var modifyvalue = $(el).find('font[class="modifyvalue"]');
						if(modifyvalue.length > 0){
							len = len - modifyvalue.context.innerText.visualLength("10.5pt",fontFamily);
						}
						
						$(el).find('input[type="text"]').css('width', len  + 'pt');
						//$(el).find('input[type="text"]').css('width', (len -2)/12 + 'rem');
					}
		}
		
		
		//初始化输入控件
		$('span[type="inputunit"]').inputunit({
			enable:Esgin,
			onLoad: function(el, dbid){
				//异步加载输入域文本
				GetJcHtmlInputValue(el, dbid);		
			},
			onSave: function(el,dbid, value) {
				let params = getRequestParameters()
				// alert(JSON.stringify(inputschange[dbid]))
				if(inputschange[dbid].success === 'false'){
					maskDialog(inputschange[dbid].message || '暂时不允许离线修改')
					if(!isEmpty(inputs[dbid].value))
				{
					$(el).inputunit('setValue', inputs[dbid].value);
				}
				}else{
					// 可以修改
					// 修改js里的数据
					// alert(value)
					inputs[dbid].value = value;
					// 更新离线inputs内容
					// that._saveData(info.userid+':'+jcid+':input',dbid,r.data,'离线存储Input框数据');
					let data = {value:value};
					maskDialog('更新离线inputs内容')
					try{
						sendMessage('updateinput:'+params.userid+':'+params.jcid+':'+dbid+':'+JSON.stringify(data));
						// alert('updateinput:'+params.userid+':'+params.jcid+':'+dbid+':'+JSON.stringify(data))
						// 更新上传内容
						let data2 = {
							jcid:params.jcid,
							userid:params.userid,
							dbid:dbid,value:value,
							validator:$(el).attr('validator'),
							inputvalueopt:$(el).attr('inputvalueopt')
						};
						sendMessage('updateinputpost:'+params.userid+':'+params.jcid+':'+dbid+':'+JSON.stringify(data2));
					}catch(e){
						alert(e.message)
					}
					

				}
				
				// maskDialog("暂时不允许离线修改!");
				// if(!isEmpty(inputs[dbid].value))
				// {
				// 	$(el).inputunit('setValue', inputs[dbid].value);
				// }
				// 			return;
				// $.ajax({
				// 	type:'post',
				// 	dataType:'json',
				// 	url:"http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/SaveJcHtmlInputValue.do",
				// 	data:{"jcid":JcId,"userid":userid,"dbid":dbid,"value":value,"validator":$(el).attr('validator'),"inputvalueopt":$(el).attr('inputvalueopt')},
				// 	success:function(data){
				// 		if(data.success === 'false'){
				// 			maskDialog(data.message);
				// 			if(!isEmpty(data.value))
				// 			{
				// 				$(el).inputunit('setValue', data.value);
				// 			}
				// 		}else{
				// 			//如果关联了签署,需要删除对应的签署
				// 			if(!isEmpty(data.signid)){
				// 				openEsign('deleteesign', data.posid, data.signid,new Array(data.location));
				// 			}
						
				// 		}
				// 		//留痕刷新
				// 		//GetJcHtmlInputValue(el,dbid);
				// 	}
				// });					
			}
		});


			
		// 初始化化签署控件
		// 设置签署location
		$('table[name^=pos_location_]').each(function() {
			var locationName = $(this).attr('name');
			var location = locationName.split('_')[2];
			$(this).find('td[name="sign"]').attr('location', location);
		});
		// 设置签署button
		$('td[name="sign"]').signbutton(
				{
					displayCheck : true,
					esign : Esgin,
					onLoad : function(el, signid) {
						// $.ajax({
						// 	type : 'post',
						// 	dataType : 'json',
						// 	url : "http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcPosSign.do",
						// 	data : {
						// 		"jcid" : JcId,
						// 		"location" : $(el).attr('location')
						// 	},
						// 	success : function(data) {
						// 		$(el).signbutton('initValue', data.signid,
						// 				data.posid);
						// 		if (!$.isEmptyObject(data.base64)) {
						// 			$(el).signbutton('signSuccess',data.base64);
						// 		}
						// 	}
						// });
						let data = possigndata[$(el).attr('location')]
						$(el).signbutton('initValue', data.signid,
								data.posid);
						if (!$.isEmptyObject(data.base64)) {
							$(el).signbutton('signSuccess',data.base64);
						}

					},
					onClick : function(target, signid, posid) {
						if(!clickEnable){
							maskDialog("请等待签署操作完成!");
							return;
						}
						
						// 判断此操作是批量签署还是的单个签署
						var opt = $.data(target, 'signbutton').options;
						var locationArr = new Array();
						var index = 0;
						locationArr[index] = $(target).attr('location');
						if (opt.isChecked) {
							// maskDialog("离线暂不支持批签");  // 这个为离线独有
							// return;
							// 获取所有选中的签署
							$('td[name="sign"][batchsign="true"] ').each(
									function() {
										locationArr[index] = $(this).attr(
												'location');
										index += 1;
									});
						}
						// 验证是否可以进行签署
						// $.ajax({
						// 	type : 'post',
						// 	dataType : 'json',
						// 	url : "http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/VerifyJcPosSign.do",
						// 	data : {
						// 		"jcid" : JcId,
						// 		"location" : locationArr.join(',')
						// 	},
						// 	success : function(data) {
						// 		console.log(data)
						// 		VerifyJcPosSign(data);						
						// 	},error:function(error){

						// 	}
						// });
						let data = []
						for(let i=0;i<locationArr.length;i++){
							data.push(possigndata[locationArr[i]])
						}
						// alert(JSON.stringify(data))
						// if(data.fromoffline){
							VerifyJcPosSign(data)

						// }


					},
					onImgClick : function(target) {
						if(!clickEnable){
							maskDialog("请等待签署操作完成!");
							return;
						}
						// 判断是否是本人进行修改
						// $.ajax({
						// 	type : 'post',
						// 	dataType : 'json',
						// 	url : "http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/VerifySigner.do",
						// 	data : {
						// 		"jcid" : JcId,
						// 		"location" : $(target).attr('location'),
						// 		"userid":userid
						// 	},
						// 	success : function(data) {
						// 		if (data.success === 'true') {
						// 			signModifyDialog(target, data.posid,
						// 					data.signid,new Array($(target).attr('location')));
						// 		} else {
						// 			maskDialog(data.message);
						// 		}
						// 	}
						// });
						let data = possigndata[$(target).attr('location')]
						if(data.fromoffline){
							signModifyDialog(target, data.posid,
											data.signid,new Array($(target).attr('location')));
						}else{
							signModifyDialog(target, data.posid,
											data.signid,new Array($(target).attr('location')));
							// maskDialog("只能修改离线后的签署签名");
						}
					}
				});
		function VerifyJcPosSign(data){
			//data = [data]
			var posidArr = new Array(data.length);
			var signidArr = new Array(data.length);
			var locationArr = new Array(data.length);
			var firstSignClass = data[0];
			if(!isEmpty(firstSignClass.message)){
				maskDialog(firstSignClass.message);
			}
			for (var i=0;i<data.length;i++)
			{
				var signClass = data[i];
				if(!isEmpty(signClass.message)){
					if(!isEmpty(signClass.base64)){
						$('td[name=sign][location='+ signClass.location +']').signbutton('signSuccess',signClass.base64);
					}					
					continue;
				}
				posidArr[i] = signClass.posid;
				signidArr[i] = signClass.signid;
				locationArr[i] = signClass.location;
			}
			if(!isEmpty(signidArr[0])){
				// 调用签署验证
				openEsign('esign', posidArr.join(','), signidArr.join(','),locationArr);
			}
		}

		

		// 初始化完工签署
		$('td[name="accomplishedSign"]').signbutton({
			esign : Esgin,
			onLoad : function(el, jcid) {
				// $.ajax({
				// 	type : 'post',
				// 	dataType : 'json',
				// 	url : "http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/GetJcComplishSign.do",
				// 	data : {
				// 		"jcid" : JcId
				// 	},
				// 	success : function(data) {
				// 		if (!$.isEmptyObject(data.base64)) {
				// 			$(el).signbutton('signSuccess', data.base64);
				// 			$('td[name="accomplishedDate"]').find('font')[0].innerText = data.date;
				// 		}
				// 	}
				// });
				if (!$.isEmptyObject(complishData.base64)) {
					$(el).signbutton('signSuccess', complishData.base64);
					$('td[name="accomplishedDate"]').find('font')[0].innerText = complishData.date;
				}
			},
			onClick : function(target, jcid, posid) {
				if(!clickEnable){
					maskDialog("请等待签署操作完成!");
					return;
				}
				
				// $.ajax({
				// 	async : false,
				// 	type : 'post',
				// 	url : "http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/VerifyJcComplishSign.do",
				// 	data : {
				// 		"jcid" : JcId
				// 	},
				// 	success : function(data) {
				// 		var obj = eval("(" + data + ")");
				// 		if (!$.isEmptyObject(obj)) {
				// 			maskDialog(obj);
				// 		} else {							
				// 			// 调用完工签署验证
				// 			openEsign('esign', 'jcid', JcId);
				// 			// 隐藏按钮
				// 			// target.hide();
				// 		}

				// 	}
				// });
				if (!$.isEmptyObject(complishData)) {
					maskDialog(complishData);
				} else {							
					maskDialog("离线无法完工签署");
					return;
					// 调用完工签署验证
					openEsign('esign', 'jcid', JcId);
					// 隐藏按钮
					// target.hide();
				}
			},
			onImgClick : function(target) {
	
				if(!clickEnable){
					maskDialog("请等待签署操作完成!");
					return;
				}
				// 判断是否是本人进行修改
				// $.ajax({
				// 	type : 'post',
				// 	dataType : 'json',
				// 	url : "http://wechattest.ameco.com.cn:8090/xmis/LMJcAction/VerifySigner.do",
				// 	data : {
				// 		"jcid" : JcId,
				// 		"location" : $(target).attr('location'),
				// 		"signtype" : "accomplishedSign",
				// 		"userid" : userid
				// 	},
				// 	success : function(data) {
				// 		if (data.success === 'true') {
				// 			signModifyDialog(target, "jcid", JcId);
				// 		} else {
				// 			maskDialog(data.message);
				// 		}
				// 	}
				// });
				maskDialog("离线无法修改完工签署");
				return;
				if(complishData.fromoffline){
					signModifyDialog(target, "jcid", JcId);
				}else {
					maskDialog("无法修改完工此签名");
				}
			}
		});

		
			
		window.onload = function(){
			//监听签署返回信息
			window.document.addEventListener('message',function(msgObj){
				//alert('电签返回信息: '+ msgObj.data);
				// alert("message")
				var data = msgObj.data.split(':');
				//正常修改签署
				if(data[0] === 'base64'){
					if(data[1] === 'jcid'){
						var now = new Date();
						$('td[name="accomplishedSign"]').signbutton('signSuccess',data[2]);						
						$('td[name="accomplishedDate"]').find('font')[0].innerText = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
						$('td[name="accomplishedDate"]').find('font').css('display', 'inline-block');						
					}else{
						// alert("普通签署")
						var locationArr = data[3].split(',');
						// alert(locationArr)
						// alert(data[2])
						for (var i=0;i<locationArr.length;i++)
						{
							$('td[name=sign][location='+ locationArr[i] +']').signbutton('signSuccess',data[2]);
						}
					}									
				}
				
				//删除签署
				if(data[0] === 'deleteesign'){
					if(data[1] === 'jcid'){
						$('td[name="accomplishedSign"]').signbutton('signDelete');	
						$('td[name="accomplishedDate"]').find('font')[0].innerText = '';
						$('td[name="accomplishedDate"]').find('font').css('display', 'inline-block');
					}else{
						$('td[name=sign][location='+ data[2] +']').signbutton('signDelete');
					}	
														
				}
				
				//电签错误或取消
				if(data[0] === 'error'){
					if(data[1] === 'jcid'){
						$('td[name="accomplishedSign"]').signbutton('signDisplay',true);
						$('td[name="accomplishedDate"]').find('font').css('display', 'inline-block');
					}else{
						var locationArr = data[1].split(',');
						for (var i=0;i<locationArr.length;i++)
						{
							$('td[name=sign][location='+ locationArr[i] +']').signbutton('signDisplay',true);
						}
					}										
				}
				
				clickEnable = true;
			});
		};
		
		
		
		
		function isEmpty(obj){
			if(typeof obj == "undefined" || obj == null || obj == ""){
				return true;
			}else{
				return false;
			}
		}
		
		function openEsign(operate,firstid,secondid,location){
			clickEnable = false;
			//隐藏签署相关控件
			if(!isEmpty(location)){
				for (var i=0;i<location.length;i++)
				{			        
			        $('td[name=sign][location='+ location[i] +']').signbutton('signDisplay',false);
				}
				
				//alert('开始电签 '+ operate +' location:' + firstid + 'signid:' +secondid);
				window.postMessage(operate + ':' + firstid + ':' + secondid + ':' + location.join(','),'*');
			}else{
				$('td[name="accomplishedSign"]').signbutton('signDisplay',false);
				$('td[name="accomplishedDate"]').find('font').css('display', 'none');
					
				// alert('开始完工电签 '+ operate +' posid:' + firstid + 'signid:' +secondid);
				window.postMessage(operate + ':' + firstid + ':' + secondid,'*');
			}			
			
			//多个id以逗号分隔
			
			//工序签署	openEsign('esign',posid,signid,location) 需要返回('base64',signid,base64,location)
			
			//完工签署openEsign('esign','jcid',JcId) 需要返回('base64','jcid',base64)
						
			//修改签署openEsign('modifyesign',工序完工日期三种数值同上,工序完工日期三种数值同上,location) 需要返回(工序完工日期三种数值同上,location)
			
			//删除签署openEsign('deleteesign',工序完工日期三种数值同上,工序完工日期三种数值同上,location) 需要返回('deleteesign',工序完工日期三种数值同上,location)
						
		}
		

		
		$.when($.ajax(), $.ajax()).then(function(){
		    // 结束
			endLoading();
		});
		
		
	}

})