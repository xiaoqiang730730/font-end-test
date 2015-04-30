;
(function() {
	/**
	 * RongIMClient核心类
	 * @author RongCloud
	 * @exports RongIMClient
	 * @class RongIMClient.
	 * @param {string} _key 下载的appkey
	 * @constructor
	 * @version 0.9.4
	 */
	this.RongIMClient = function(_key) {
		var io, appkey = _key,
			topicType = {
				"1": "3",
				"2": "1",
				"3": "2",
				"4": "0"
			},
			listener, instance, check = function(types, iscon) {
				var args = arguments.callee.caller.arguments;
				if (arguments.callee.caller.length == args.length && (instance || iscon)) {
					for (var i = 0, len = args.length; i < len; i++) {
						if (!Object.prototype.toString.call(args[i]).toLowerCase().indexOf(types[i])) {
							throw new Error("ErrorTypeExpection，第" + i + "个参数类型为" + types[i]);
						}
					}
				} else {
					throw new Error("NullPointExpection:参数不正确或未实例化RongIMClient");
				}
			},
			queue = [],
			textDraft = sessionStorage || new function() {
				var storage = {},
					length = 0;
				this.clear = function() {
					storage = {};
					length = 0;
				};
				this.setItem = function(key, value) {
					!storage[key] ? length++ : void 0;
					storage[key] = value;
					return key in storage;
				};
				this.getItem = function(key) {
					return storage[key];
				};
				this.removeItem = function(key) {
					delete storage[key];
					var flag = !(key in storage);
					flag ? length-- : void 0;
					return flag;
				};
			};
		/**
		 * 调试选项.
		 * @type {RongIMClient.Options}
		 * @public
		 */
		this.options = new RongIMClient.Options();
		/**
		 * 清除消息草稿.
		 * @return {boolean} 是否清除成功
		 * @param {RongIMClient.ConversationType} _conversationType 回话类型
		 * @param {string} _targetId 设置目标ID
		 * @throws {error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.clearTextMessageDraft = function(_conversationType, _targetId) {
			check(["object", "string"]);
			var type = _conversationType.getValue();
			return textDraft.removeItem(type + "_" + _targetId);
		};
		/**
		 * 获得消息草稿.
		 * @param {RongIMClient.ConversationType} _conversationType 回话类型
		 * @param {string} _targetId 设置目标ID
		 * @return {string} 草稿
		 * @throws {error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getTextMessageDraft = function(_conversationType, _targetId) {
			check(["string", "string"]);
			return textDraft.getItem(_conversationType.getValue() + "_" + _targetId);
		};
		/**
		 *保存消息草稿.
		 * @param {RongIMClient.ConversationType} _conversationtype 回话类型
		 * @param {string} _targetid 设置目标ID
		 * @param  {string} _content 草稿内容
		 * @return {boolean} _content 是否保存成功
		 * @throws {error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.saveTextMessageDraft = function(_conversationtype, _targetid, _content) {
			check(["onject", "string", "string"]);
			var type = _conversationtype.getValue();
			return textDraft.setItem(type + "_" + _targetId, _content);
		};
		/**
		 *初始化SDK.
		 * @param {string} appk 申请的appkey
		 * @public
		 */
		this.init = function(appk) {
			appkey = appk;
		};
		/**
		 * 获得消息链接的通道.
		 * @return {object} 连接通道对象
		 * @throws {error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getIO = function() {
			check();
			return io;
		};
		/**
		 * 连接融云服务器.
		 * @param {string} _token 得到的token
		 * @param {object(onSuccess,onError)|RongIMClient.callback} _callback 连接的回调
		 * @public
		 */
		this.connect = function(_token, _callback) {
			check(["string", "object"], true);
			instance = new window.RongBridge(appkey, _token, _callback);
			io = instance.getIO();
			if (queue.length) {
				for (var i = 0; i < queue.length; i++) {
					instance[queue[i].name](queue[i].args);
				}
				queue = [];
			}
			if (listener)
				instance.setConnectionStatusListener(RongIMClient.ConnectionStatusListener.ConnectionStatus, listener);
		};
		/**
		 * 断开服务器.
		 * @throws {error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.disconnect = function() {
			check();
			if (instance) {
				instance.disConnect();
			}
		};
		/**
		 * 重连服务器.
		 * @param {object(onSuccess,onError)|RongIMClient.callback} callback 重连回调
		 * @throws {error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.reconnect = function(callback) {
			check();
			if (instance) {
				instance.reConnect(callback);
			}
		};
		/**
		 * 得到会话.
		 * @param {RongIMClient.ConversationType} _conversationType 回话类型
		 * @param {string} _targetId 目标ID
		 * @return {RongIMClient.ConversationType|null} 返回得到的回话，如果指定的回话不存在则返回NULL
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getConversation = function(_conversationType, _targetId) {
			check(["object", "string"]);
			var val = io.util.filter(this.getConversationList(), function(item) {
				return item.getTargetId() == _targetId && item.getConversationType().getValue() == _conversationType.getValue();
			});
			return val.length ? val[0] : null;
		};
		/**
		 * 得到会话列表.
		 * @return {Array} 会话列表
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getConversationList = function() {
			check();
			return instance.getCurrentConversationList();
		};
		/**
		 * 得到过时的（已经被删除的）会话列表.
		 * @return {Array} 会话列表
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getOldestConversationTypeList = function() {
			check();
			return instance.getCurrentOldestConversationList();
		};
		/**
		 * 得到指定会话的通知状态.
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 目标ID
		 * @param {Object(onSuccess,onError)|RongIMClient.callback} _callback 得到会话通知状态的回调
		 * @return {RongIMClient.ConversationNotificationStatus} 会话通知状态
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getConversationNotificationStatus = function(_conversationType, _targetId, _callback) {
			check(["object", "string", "object"]);
			var val = this.getConversation(_conversationType, _targetId);
			if (val) {
				_callback.onSuccess(val.getNotificationStatus());
			} else {
				_callback.onError(RongIMClient.callback.ErrorCode.setValue(1));
			}
		};
		/**
		 * 获得群组会话列表.
		 * @return {Array} 群组会话列表
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getGroupConversationList = function() {
			check();
			return io.util.filter(this.getConversationList(), function(item) {
				return item.getTargetId().charAt(0) == "3";
			});
		};
		/**
		 * 删除指定会话
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 指定会话ID
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.removeConversation = function(_conversationType, _targetId) {
			check(["object", "string"]);
			var val = io.util.remove(this.getConversationList(), function(item) {
				return item.getTargetId() == _targetId && item.getConversationType().getValue() == _conversationType.getValue();
			});
			instance.getOldestConversationTypeList().unshift(val);
			instance.removeConversationListCache();
		};
		this.removeConversationListCache = function() {
			instance.removeConversationListCache();
		};
		/**
		 * 设置会话通知状态.
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 指定ID
		 * @param {RongIMClient.ConversationNotificationStatus=} _notificationStatus 会话通知状态
		 * @param {Object(onSuccess,onError)|RongIMClient.callback} _callback 设置之后的回调
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.setConversationNotificationStatus = function(_conversationType, _targetId, _notificationStatus, _callback) {
			check(["object", "string", "object", "object"]);
			var val = this.getConversation(_conversationType, _targetId);
			if (val) {
				val.setNotificationStatus(_notificationStatus);
				_callback.OnSuccess(_notificationStatus);
			} else {
				_callback.onError(RongIMClient.callback.ErrorCode.setValue(1));
			}
		};
		/**
		 * 将指定会话设置置顶.
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 指定ID
		 * @return {boolean} 是否置顶成功
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.setConversationToTop = function(_conversationType, _targetId) {
			check(["object", "string", "object"]);
			var val = this.getConversation(_conversationType, _targetId);
			val.setTop();
		};
		/**
		 * 设置会话名称.
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 指定目标ID
		 * @param {string} setConversationTitle 会话名称
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.setConversationName = function(_conversationType, _targetId, setConversationTitle) {
			check(["object", "string", "string"]);
			var val = this.getConversation(_conversationType, _targetId);
			val.setConversationTitle(setConversationTitle);
		};
		/**
		 * 创建一个会话.
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 指定目标ID
		 * @param {string} _conversationname 会话名称
		 * @return {RongIMClient.Conversation} 返回一个会话，要是不存在就创建并返回，如果存在则返回
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.createConversation = function(_conversationType, _targetId, _conversationname) {
			check(["object", "string", "string"]);
			var val = io.util.filter(this.getConversationList(), function(item) {
				return item.getTargetId() == _targetId;
			});
			if (val.length > 0)
				return val[0];
			var conver = new RongIMClient.Conversation();
			conver.setTargetId(_targetId);
			conver.setConversationType(_conversationType);
			conver.setConversationTitle(_conversationname);
			conver.setTop();
			return conver;
		};
		/**
		 * 得到当前用户信息.
		 * @return {RongIMClient.UserInfo} 用户信息
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getCurrentUserInfo = function() {
			check();
			return instance.getCurrentUserInfo();
		}; //userInf
		/**
		 * 得到指定用户信息
		 * @param {string} _userId 指定用户ID
		 * @param {Object(onSuccess,onError)|RongClient.callback} _callback 得到用户信息之后的回调
		 * @return {RongIMClient.UserInfo} 用户信息
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.getUserInfo = function(_userId, _callback) {
			check(["string", "object"]);
			var modules = new Modules.GetUserInfoInput();
			modules.setNothing(1);
			instance.queryMsg("5", io.util.arrayFrom(modules.toArrayBuffer()), _userId, _callback, "GetUserInfoOutput");
		}; //userInf
		/**
		 * 发送消息.
		 * @param {RongIMClient.ConversationType} conversationType 会话类型
		 * @param {string} targetId 指定目标ID
		 * @param {RongIMClient.MessageContent} content MessageContent消息类
		 * @param {RongIMClient.MessageHandler} messageHandler 消息处理类
		 * @param {Object(onSuccess,onError)|RongClient.callback} callback 发送消息之后的回调
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.sendMessage = function(conversationType, targetId, content, messageHandler, callback) {
			check(["object", "string", "object", "object", "object"]);
			if (messageHandler) {
				messageHandler.process(content.getMessage());
			}
			var topic = topicType[conversationType.getValue()],
				data = content.encode(),
				msg = content.getMessage(),
				_index = -1,
				con;
			if (!topic)
				throw new Error("NullPointExpection");
			msg.setConversationType(conversationType);
			msg.setMessageDirection(RongIMClient.MessageDirection.SEND);
			msg.setMessageId(topic + ":" + Date.now());
			msg.setSentStatus(RongIMClient.SentStatus.SENDING);
			msg.setSenderUserId(this.getCurrentUserInfo().getUserId());
			msg.setSentTime(Date.now());
			msg.setTargetId(targetId);
			//放到会话列
			con = io.util.filter(this.getConversationList(), function(item, i) {
				if (item.getTargetId() == targetId) {
					_index = i;
					return true;
				}
				return false;
			})[0] || io.util.remove(this.getOldestConversationTypeList(), function(item) {
				return item.getTargetId() == targetId;
			});
			if (!con) {
				con = new RongIMClient.Conversation();
				con.setTargetId(targetId);
				con.setConversationType(conversationType);
				con.setConversationTitle("");
			}
			con.setSentTime(Date.now());
			con.setSentStatus(RongIMClient.SentStatus.SENDING);
			con.setSenderUserName(""); //client_intance.userInfo.getUserName()
			con.setSenderUserId(this.getCurrentUserInfo().getUserId()); //client_intance.userInfo.getUserId()
			con.setObjectName(msg.getObjectName());
			con.setNotificationStatus(RongIMClient.ConversationNotificationStatus.DO_NOT_DISTURB);
			con.setLatestMessageId(msg.getMessageId());
			con.setLatestMessage(content);
			con.setUnreadMessageCount(0);
			if (_index != 0) {
				con.setTop();
			}
			instance.pubMsg(topic, data, targetId, callback, msg);
		}; //ppMsgP
		/**
		 * 设置选项，是否打印调试.
		 * @param {boolean} _isenable 是否设置选项
		 * @public
		 */
		this.setOptions = function(_isenable) {
			this.options.setEnableDebug(_isenable);
		};
		/**
		 * 上传媒体文件.
		 * @param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @param {string} _targetId 目标id
		 * @param {Object} _stream 流内容
		 * @param {Object(onSuccess,onError)|RongIMClient.callback} _callback 回调函数
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 * @ignore
		 */
		this.uploadMedia = function(_conversationType, _targetId, _stream, _callback) {
			check(["object", "string", "string", "object"]);
		}; //qnTkn
		/**
		 * 获取上传下载媒体文件权限的token
		 * @param {Object(onSuccess,onError)|RongIMClient.callback} callback 回调函数
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 * @ignore
		 */
		this.getUploadToken = function(callback) {
			check(["object"]);
			var modules = new Modules.GetQNupTokenInput();
			modules.setType(1);
			instance.queryMsg("14", io.util.arrayFrom(modules.toArrayBuffer()), this.getCurrentUserInfo().getUserId(), callback, "GetQNupTokenOutput")
		};
		/**
		 * 获取下载媒体文件的url.
		 * @param {string} token
		 * @param {Object(onSuccess,onError)|RongIMClient.callback} callback 回调函数
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 * @ignore
		 */
		this.getdownloadUrl = function(token, callback) {
				check(["string", "object"]);
				var modules = new Modules.GetQNdownloadUrlInput();
				modules.setType(1);
				modules.setKey(token);
				instance.queryMsg("14", io.util.arrayFrom(modules.toArrayBuffer()), this.getCurrentUserInfo().getUserId(), callback, "GetQNdownloadUrlOutput")
			}
			/**
			 * 设置连接状态的监听器.
			 * @param {(object(onChanged)|RongIMClient.ConnectionStatusListener)} _listener 监听器对象
			 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
			 * @public
			 */
		this.setConnectionStatusListener = function(_listener) {
			if (!instance) {
				listener = _listener;
			} else {
				instance.setConnectionStatusListener(RongIMClient.ConnectionStatusListener.ConnectionStatus, listener)
			}
		};
		/**
		 * 设置接受消息的监听器.
		 * @param {(object(onChanged)|RongIMClient.OnReceiveMessageListener)} _listener 监听器对象
		 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
		 * @public
		 */
		this.setOnReceiveMessageListener = function(_listener) {
			if (instance)
				instance.setReceiveMessageListener(_listener);
			else
				queue.push({
					name: "setReceiveMessageListener",
					args: _listener
				});
		};
	};
	/**
	 * 返回RongIMclient实例，这是一个单例模式，使用这个方法必须在执行connect方法之后使用.
	 * @return {RongIMClient} 实例化之后的RongIMClient对象
	 * @static
	 */
	RongIMClient.getInstance = function() {};
	/**
	 * 生成一个消息监听器对象以供(instance of RongIMClient).setOnReceiveMessageListener调用，用来监听收到的消息.
	 * @param {function} _onreceived 处理消息的函数
	 * @return {object(onReceived)} 处理消息对象
	 * @static
	 */
	RongIMClient.OnReceiveMessageListener = function(_onreceived) {
		return {
			onReceived: _onreceived
		}
	};
	/**
	 * 生成一个连接状态监听器对象以供RongIMClient.setConnectionStatusListener调用，用来监听连接状态.
	 * @param {function} _onchanged 处理连接状态的函数
	 * @return {object(onChanged)} 处理连接状态对象
	 * @static
	 */
	RongIMClient.ConnectionStatusListener = function(_onchanged) {
		return {
			onChanged: _onchanged
		}
	};
	/**
	 * 连接状态枚举对象.
	 * @param {number} code 连接状态枚举值
	 * @exports RongIMClient.ConnectionStatusListener.ConnectionStatus
	 * @class RongIMClient.ConnectionStatusListener.ConnectionStatus.
	 * @constructor
	 */
	RongIMClient.ConnectionStatusListener.ConnectionStatus = function(code) {
		var d = code || 0,
			c = ["连接成功", "连接中", "未知错误", "重连", "用户账户在其他设备登陆，本机会被提掉线", "已关闭"];
		/**
		 * 连接成功.
		 * @type {number}
		 * @public
		 */
		this.CONNECTED = 0;
		/**
		 * 连接中.
		 * @type {number}
		 * @public
		 */
		this.CONNECTING = 1;
		/**
		 * 未知错误.
		 * @type {number}
		 * @public
		 */
		this.UNKNOW = 2;
		/**
		 * 重连.
		 * @type {number}
		 * @public
		 */
		this.RECONNECT = 3;
		/**
		 * 用户账户在其他设备登陆，本机会被提掉线.
		 * @type {number}
		 * @public
		 */
		this.OTHER_DEVICE_LOGIN = 4;
		/**
		 * 已关闭.
		 * @type {number}
		 * @public
		 */
		this.CLOSED = 5;
		/**
		 * 获得当前状态的消息内容.
		 * @return {string}
		 * @public
		 */
		this.getMessage = function() {
			return c[d]
		};
		/**
		 * 得到当前的状态值.
		 * @return {number}
		 * @public
		 */
		this.getValue = function() {
			return d
		}
	};
	/**
	 * 通过状态码将连接状态设置为指定的状态.
	 * @param {number} code 连接状态枚举值
	 * @return {RongIMClient.ConnectionStatusListener.ConnectionStatus}.
	 * @static
	 */
	RongIMClient.ConnectionStatusListener.ConnectionStatus.setValue = function(code) {
		return new RongIMClient.ConnectionStatusListener.ConnectionStatus(code);
	};
	/**
	 * 连接服务器的回调.
	 * @exports RongIMClient.ConnectCallback
	 * @class RongIMClient.ConnectCallback.
	 * @extends RongIMClient.callback 继承自RongIMClient.callback
	 * @constructor
	 */
	RongIMClient.ConnectCallback = function() {
		RongIMClient.callback.apply(this, arguments);
	};
	/**
	 * 连接回调状态枚举对象.
	 * @param {number} code 连接回调状态枚举值
	 * @return {RongIMClient.ConnectCallback.ErrorCode}.
	 * @exports RongIMClient.ConnectCallback.ErrorCode
	 * @class RongIMClient.ConnectCallback.ErrorCode
	 * @constructor
	 */
	RongIMClient.ConnectCallback.ErrorCode = function(code) {
		var val = code || 0,
			msg = ["接受", "不可用的协议版本", "标识符被拒绝", "服务器不可用", "错误的账号和密码", "没有验证用户", "重定向"];;
		/**
		 * 接受.
		 * @type {number}
		 * @public
		 */
		this.ACCPTED = 0;
		/**
		 * 不可用的协议版本.
		 * @type {number}
		 * @public
		 */
		this.UNACCEPTABLE_PROTOCOL_VERSION = 1;
		/**
		 * 标识符被拒绝.
		 * @type {number}
		 * @public
		 */
		this.IDENTIFIER_REHECTED = 2;
		/**
		 * 服务器不可用.
		 * @type {number}
		 * @public
		 */
		this.SERVER_UNAVAILABLE = 3;
		/**
		 * 错误的账号和密码.
		 * @type {number}
		 * @public
		 */
		this.BAD_USEERNAME_OR_PASSWORD = 4;
		/**
		 * 没有验证用户.
		 * @type {number}
		 * @public
		 */
		this.NOT_AUTHORIZED = 5;
		/**
		 * 重定向.
		 * @type {number}
		 * @public
		 */
		this.REDIRECT = 6;
		/**
		 * 获得当前状态的消息内容.
		 * @return {string}
		 * @public
		 */
		this.getMessage = function() {
			return msg[val];
		};
		/**
		 * 得到当前的状态值.
		 * @return {number}
		 * @public
		 */
		this.getValue = function() {
			return val;
		};
	};
	/**
	 * 通过指定连接回调状态码将连接回调状态设置为指定的状态.
	 * @param {number} code 连接回调状态枚举值
	 * @return {RongIMClient.ConnectCallback.ErrorCode}.
	 * @static
	 */
	RongIMClient.ConnectCallback.ErrorCode.setValue = function(code) {
		return new RongIMClient.ConnectCallback.ErrorCode(code);
	};
	RongIMClient.ConnectCallback.prototype = new RongIMClient.callback();
	RongIMClient.ConnectCallback.prototype.constructor = RongIMClient.ConnectCallback;
	/**
	 * 生成一个回调对象以供回调使用.
	 * @param {function} onSuccess 操作成功时处理的函数
	 * @param {function} onError 操作失败时处理的函数
	 * @exports RongIMClient.callback
	 * @class RongIMClient.callback.
	 * @constructor
	 */
	RongIMClient.callback = function(onSuccess, onError) {
		this.onError = onError;
		this.OnSuccess = onSuccess;
	};
	/**
	 * 回调状态枚举对象.
	 * @param {number} code 回调状态枚举值
	 * @exports RongIMClient.callback.ErrorCode
	 * @class RongIMClient.callback.ErrorCode
	 * @return {RongIMClient.ConnectCallback.ErrorCode}.
	 * @constructor
	 */
	RongIMClient.callback.ErrorCode = function(code) {
		var val = code || 0,
			desc = ["服务器超时", "未知错误"];
		/**
		 * 服务器超时.
		 * @type {number}
		 * @public
		 */
		this.TIMEOUT = 0;
		/**
		 * 未知错误.
		 * @type {number}
		 * @public
		 */
		this.UNKNOW = 1;
		/**
		 * 获得当前状态的消息内容.
		 * @return {string}
		 * @public
		 */
		this.getMessage = function() {
			return desc[val];
		};
		/**
		 * 获得当前状态值.
		 * @return {number}
		 * @public
		 */
		this.getValue = function() {
			return val;
		}
	};
	/**
	 * 通过回调状态枚举值将回调状态设置为指定的状态.
	 * @param {number} code 回调状态枚举值
	 * @return {RongIMClient.callback.ErrorCode}.
	 * @static
	 */
	RongIMClient.callback.ErrorCode.setValue = function(code) {
		return new RongIMClient.callback.ErrorCode(code);
	};
	/**
	 * 连接服务器,用于初始化整个RongIMClient对象，执行该方法之前必须先执行RongIMClient.init方法.
	 * @param {string} _token 得到的token
	 * @param {object(onSuccess,onError)|RongIMClient.callback} _callback 回调函数
	 * @throws {Error} 参数不正确或者RongIMClient类未实例化成功
	 * @static
	 */
	RongIMClient.connect = function(_token, _callback) {
		if (!RongIMClient.getInstance) {
			throw new Error("unInitExpection");
		}
		if (window.Modules) {
			RongIMClient.getInstance().connect(_token, _callback);
		} else {
			RongIMClient.connect.token = _token;
			RongIMClient.connect.callback = _callback;
		}
	};
	/**
	 * 用于初始化appkey。返回RongIMClient实例，也可以用RongIMClient.getInstance()方法得到RongIMClient实例
	 * @param {string} _appkey 得到的appkey
	 * @return {RongIMClient}
	 * @static
	 */
	RongIMClient.init = function(_appkey) {
		var _ins = new RongIMClient(_appkey);
		RongIMClient.getInstance = function() {
			return _ins;
		};
		return _ins;
	};
	/**
	 * 注册自定义消息类型.messageType(string)＝消息类型，最终注册的消息对象名称与messageType名称相同；objectName(string)＝对象名称，用来区分消息对象；fieldName(array[string])＝自定义字段名称列表
	 * @param {object(messageType,objectName,fieldName)} regMsg 注册目标消息对象的配置对象
	 * @throws {Error} unInitExpection为初始化，Wrong paramters错误的参数
	 * @static
	 */
	RongIMClient.registerMessageType = function(regMsg) {
		if (!RongIMClient.getInstance) {
			throw new Error("unInitExpection")
		}
		if ("messageType" in regMsg && "objectName" in regMsg && "fieldName" in regMsg) {
			RongIMClient.registerMessageType.registerMessageTypePool.push(regMsg.messageType);
			var temp = RongIMClient[regMsg.messageType] = function(c) {
				RongIMClient.RongIMMessage.call(this, c);
				var self = this;
				RongIMClient.MessageType[regMsg.messageType] = regMsg.messageType;
				this.setMessageType(regMsg.messageType);
				this.setObjectName(regMsg.objectName);
				var fieldList = regMsg.fieldName;
				io.util.forEach(fieldList, function(item) {
					self["set" + item] = function(a) {
						self.setContent(a, item);
					};
					self["get" + item] = function() {
						return self.getDetails()[item];
					};
				});
				this.getDetail = function() {
					return this.getDetails();
				}
			};
			temp.prototype = new RongIMClient.RongIMMessage();
			temp.prototype.constructor = temp;
		} else
			throw new Error("Wrong paramters");
	};
	/**
	 * 已注册自定义消息对象池
	 * @type {Array}
	 * @static
	 */
	RongIMClient.registerMessageType.registerMessageTypePool = [];
	/**
	 * 设置连接状态监听器.
	 * @param {(object(onChanged)|RongIMClient.ConnectionStatusListener)} listener 监听器对象
	 * @throws {Error} RongIMClient类未能正确init初始化,unInitExpection
	 * @static
	 */
	RongIMClient.setConnectionStatusListener = function(listener) {
		if (!RongIMClient.getInstance) {
			throw new Error("unInitExpection");
		}
		RongIMClient.getInstance().setConnectionStatusListener(listener);
	};
	/**
	 * 设置是否打印执行过程.
	 * @param {boolean} _option 是否打印
	 * @static
	 */
	RongIMClient.setOptions = function(_option) {
		if (RongIMClient.getInstance) {
			RongIMClient.getInstance().setOptions(!!_option);
		}
	};
	/**
	 * 所有消息类的基类.
	 * @exports RongIMClient.RongIMMessage
	 * @class RongIMClient.RongIMMessage.
	 * @constructor
	 */
	RongIMClient.RongIMMessage = function() {
		var messagetype = "unknow",
			receivedtime, extra, details = {},
			conversationtype, direction, messageid, objectname, receivestatus, senderuserid, sentstatus, sendtime, targetid;
		/**
		 * 得到内容详情对象.
		 * @public
		 */
		this.getDetail = function() {};
		/**
		 * 设置内容详情对象.
		 * @param {object} x 内容详情对象
		 * @public
		 */
		this.setDetails = function(x) {
			details = x;
		};
		/**
		 * 得到所有内容对象.
		 * @param {boolean} isJson 是否转为json对象
		 * @return {object}
		 * @public
		 */
		this.getDetails = function(isJson) {
			if (isJson) {
				return RongIMClient.getInstance().getIO().util.JSONStringify(details);
			}
			return details;
		};
		/**
		 * 得到具体内容对象.
		 * @return {string}
		 * @public
		 */
		this.getContent = function() {
			return details["content"];
		};
		/**
		 * 得到会话类型.
		 * @return {RongIMClient.ConversationType} 会话类型
		 * @public
		 */
		this.getConversationType = function() {
			return conversationtype;
		};
		/**
		 * 得到附加信息.
		 * @return {string}
		 * @public
		 */
		this.getExtra = function() {
			return extra;
		};
		/**
		 * 得到消息方向对象.
		 * @return {RongIMClient.MessageDirection} 消息方向对象
		 * @public
		 */
		this.getMessageDirection = function() {
			return direction;
		};
		/**
		 * 得到消息ID.
		 * @return {string}
		 * @public
		 */
		this.getMessageId = function() {
			return messageid;
		};
		/**
		 * 得到消息特性名称.
		 * @return {string}
		 * @public
		 */
		this.getObjectName = function() {
			return objectname;
		};
		/**
		 * 得到消息接收状态.
		 * @return {RongIMClient.ReceivedStatus}
		 * @public
		 */
		this.getReceivedStatus = function() {
			return receivestatus;
		};
		/**
		 * 得到消息接收时间.
		 * @return {int64} 得到接收时间戳
		 * @public
		 */
		this.getReceivedTime = function() {
			return receivedtime;
		};
		/**
		 * 得到消息发送人的Id.
		 * @return {string}
		 * @public
		 */
		this.getSenderUserId = function() {
			return senderuserid;
		};
		/**
		 * 得到消息发送状态对象.
		 * @return {RongIMClient.SentStatus}
		 * @public
		 */
		this.getSentStatus = function() {
			return sentstatus;
		};
		/**
		 * 得到目标ID.
		 * @return {string}
		 * @public
		 */
		this.getTargetId = function() {
			return targetid;
		};
		/**
		 * 设置消息内容.
		 * @param {string} c 内容
		 * @param {string} n 消息名称
		 * @public
		 */
		this.setContent = function(c, n) {
			details[n ? n : "content"] = c;
		};
		/**
		 * 设置会话类型.
		 * @param {RongIMClient.ConversationType} t 会话类型
		 * @public
		 */
		this.setConversationType = function(t) {
			conversationtype = t
		};
		/**
		 * 设置附属消息.
		 * @param {string} e 附属消息（只存储在本地）
		 * @public
		 */
		this.setExtra = function(e) {
			extra = e;
		};
		/**
		 * 设置消息方向.
		 * @param {RongIMClient.MessageDirection} d 消息方向对象
		 * @public
		 */
		this.setMessageDirection = function(d) {
			direction = d;
		};
		/**
		 * 设置消息ID.
		 * @param {string} m 消息Id
		 * @public
		 */
		this.setMessageId = function(m) {
			messageid = m;
		};
		/**
		 * 设置消息特性名称.
		 * @param {string} o 特性名称
		 * @public
		 */
		this.setObjectName = function(o) {
			objectname = o;
		};
		/**
		 * 设置消息接收状态
		 * @param {RongIMClient.ReceivedStatus} r 接收状态
		 * @public
		 */
		this.setReceivedStatus = function(r) {
			receivestatus = r;
		};
		/**
		 * 设置消息发送人Id.
		 * @param {string} s 发送人ID
		 * @public
		 */
		this.setSenderUserId = function(s) {
			senderuserid = s;
		};
		/**
		 * 设置消息发送状态.
		 * @param {RongIMClient.SentStatus} s 发送状态
		 * @return {boolean} 是否设置成功
		 * @public
		 */
		this.setSentStatus = function(s) {
			return !!(sentstatus = s);
		};
		/**
		 * 设置发送时间.
		 * @param {(int64|int)} s 时间戳
		 * @public
		 */
		this.setSentTime = function(s) {
			sendtime = s;
		};
		/**
		 * 设置目标Id.
		 * @param {string} t 目标ID
		 * @public
		 */
		this.setTargetId = function(t) {
			targetid = t;
		};
		/**
		 * 设置消息接受时间.
		 * @param {(int64|int)} t 时间戳
		 * @public
		 */
		this.setReceivedTime = function(t) {
			receivedtime = t;
		};
		/**
		 * 将消息类转换为JSON字符串.
		 * @return {string}
		 * @public
		 */
		this.toJSONString = function() {
			var val = {
				"receivedtime": receivedtime || "",
				"messagetype": messagetype,
				"extra": extra || "",
				"details": details,
				"conversationtype": conversationtype.getValue(),
				"direction": direction.getValue(),
				"messageid": messageid,
				"objectname": objectname,
				"senderuserid": senderuserid,
				"sendtime": sendtime,
				"targetid": targetid
			};
			return RongIMClient.getInstance().getIO().util.JSONStringify(val);
		};
		/**
		 * 得到消息类型.
		 * @return {RongIMClient.MessageType}
		 * @public
		 */
		this.getMessageType = function() {
			return messagetype;
		};
		/**
		 * 设置消息类型.
		 * @param {RongIMClient.MessageType} type 消息类型
		 * @public
		 */
		this.setMessageType = function(type) {
			messagetype = type;
		};
	};
	/**
	 * 会话对象.
	 * @exports RongIMClient.Conversation
	 * @class RongIMClient.Conversation.
	 * @constructor
	 */
	RongIMClient.Conversation = function() {
		var self = this,
			latestTime = Date.now(),
			objectname, senderuserid, receivedtime, ReceivedStatus, senderusername, convertsationtitle, conversationtype, draft, latestmessage, latestmessageid, sentstatus, senttime, targetid, unreadmessagecount = 0,
			notificationstatus = RongIMClient.ConversationNotificationStatus.NOTIFY;
		/**
		 * 获得会话biaoti.
		 *@return {string}
		 * @public
		 */
		this.getConversationTitle = function() {
			return convertsationtitle;
		};
		/**
		 * 得到内容详情对象.
		 *@return {JSON}
		 * @public
		 */
		this.toJSONString = function() {
			var val = {
				"senderusername": senderusername || "",
				lastTime: latestTime,
				"objectname": objectname || "",
				"senderuserid": senderuserid || "",
				"receivedtime": receivedtime || "",
				"convertsationtitle": convertsationtitle || "",
				"conversationtype": (+conversationtype == conversationtype ? conversationtype : conversationtype.getValue()),
				"latestmessageid": latestmessageid,
				"senttime": senttime || "",
				"targetid": targetid,
				"notificationstatus": notificationstatus.getValue()
			};
			return RongIMClient.getInstance().getIO().util.JSONStringify(val);
		};
		/**
		 * 设置消息接受状态.
		 *@param {RongIMClient.ReceivedStatus} _receivedStatus 消息状态枚举
		 * @public
		 */
		this.setReceivedStatus = function(_receivedStatus) {
			ReceivedStatus = _receivedStatus;
		};
		/**
		 * 得到消息接受状态.
		 *@return {RongIMClient.ReceivedStatus}
		 * @public
		 */
		this.getReceivedStatus = function() {
				return ReceivedStatus;
			}
			/**
			 * 得到会话类型.
			 *@return {RongIMClient.ConversationType}
			 * @public
			 */
		this.getConversationType = function() {
			return conversationtype;
		};
		/**
		 * 得到文字消息草稿.
		 * @public
		 */
		this.getDraft = function() {
			return draft;
		};
		/**
		 * 得到最后一条消息类.
		 @return {RongIMClient.MessageContent}
		 * @public
		 */
		this.getLatestMessage = function() {
			return latestmessage;
		};
		/**
		 * 得到最后一条消息ID.
		 *@return {string}
		 * @public
		 */
		this.getLatestMessageId = function() {
			return latestmessageid;
		};
		/**
		 * 得到会话通知状态.
		 *@return {RongIMClient.ConversationNotificationStatus}
		 * @public
		 */
		this.getNotificationStatus = function() {
			return notificationstatus;
		};
		/**
		 * 得到消息对象名称.
		 *@return {string}
		 * @public
		 */
		this.getObjectName = function() {
			return objectname;
		};
		/**
		 * 得到最后一条消息接收的时间的时间戳.
		 *@return {number}
		 * @public
		 */
		this.getReceivedTime = function() {
			return receivedtime;
		};
		/**
		 * 得到最后一条消息的发送人ID.
		 *@return {string}
		 * @public
		 */
		this.getSenderUserId = function() {
			return senderuserid;
		};
		/**
		 * 得到最后一条消息的发送人昵称.
		 *@return {string}
		 * @public
		 */
		this.getSenderUserName = function() {
			return senderusername;
		};
		/**
		 * 得到消息发送状态.
		 *@return {RongIMClient.SentStatus}
		 * @public
		 */
		this.getSentStatus = function() {
			return sentstatus;
		};
		/**
		 * 得到最后一条消息发送时间的时间戳.
		 *@return {number}
		 * @public
		 */
		this.getSentTime = function() {
			return senttime;
		};
		/**
		 *得到目标ID
		 *@return {string}
		 @public
		 */
		this.getTargetId = function() {
			return targetid;
		};
		/**
		 * 得到未读消息数.
		 *@return {number}
		 * @public
		 */
		this.getUnreadMessageCount = function() {
			return unreadmessagecount;
		};
		/**
		 * 该会话是否置顶.
		 *@return {boolean}
		 * @public
		 */
		this.isTop = function() {
			var list = RongIMClient.getInstance().getConversationList();
			return list[0] == this;
		};
		/**
		 * 设置会话标题.
		 *@param {string} _conversationTitle 会话标题
		 * @public
		 */
		this.setConversationTitle = function(_conversationTitle) {
			convertsationtitle = _conversationTitle;
		};
		/**
		 * 设置会话类型.
		 *@param {RongIMClient.ConversationType} _conversationType 会话类型
		 * @public
		 */
		this.setConversationType = function(_conversationType) {
			conversationtype = _conversationType;
		};
		/**
		 * 设置文字消息草稿.
		 *@param {string} _draft 文字消息草稿
		 * @public
		 */
		this.setDraft = function(_draft) {
			draft = _draft;
		};
		/**
		 * 设置最后一条消息发送者昵称
		 *@param {string} _senderUserName 发送者昵称
		 * @public
		 */
		this.setSenderUserName = function(_senderUserName) {
				senderusername = _senderUserName;
			}
			/**
			 * 设置最后一条消息.
			 *@param {RongIMClient.MessageContent} _latestMessage 最后一条消息
			 * @public
			 */
		this.setLatestMessage = function(_latestMessage) {
			latestmessage = _latestMessage;
		};
		/**
		 * 设置最后一条消息ID.
		 *@param {string} _latestMessageId 最后一条消息ID.
		 * @public
		 */
		this.setLatestMessageId = function(_latestMessageId) {
			latestmessageid = _latestMessageId;
		};
		/**
		 * 设置该会话消息提醒状态.
		 *@param {RongIMClient.ConversationNotificationStatus} _notificationStatus 文字消息草稿
		 * @public
		 */
		this.setNotificationStatus = function(_notificationStatus) {
			notificationstatus = _notificationStatus;
		};
		/**
		 * 设置消息对象名称.
		 *@param {string} _objectName 消息对象名称
		 * @public
		 */
		this.setObjectName = function(_objectName) {
			objectname = _objectName;
		};
		/**
		 * 设置最后一条消息接收时间的时间戳.
		 *@param {number} _receivedTime 接收时间的时间戳
		 * @public
		 */
		this.setReceivedTime = function(_receivedTime) {
			latestTime = receivedtime = _receivedTime;
		};
		/**
		 * 设置最后一条消息发送者Id.
		 *@param {number} _senderUserId 消息发送者Id.
		 * @public
		 */
		this.setSenderUserId = function(_senderUserId) {
			senderuserid = _senderUserId;
		};
		/**
		 * 得到最后接收或发送消息的时间戳.
		 *@return {number} 时间戳
		 * @public
		 */
		this.getLatestTime = function() {
				return latestTime;
			}
			/**
			 * 设置最后一条消息消息发送状态.
			 * @param {RongIMClient.SentStatus} _sentStatus 文字消息草稿
			 * @return {boolean} 是否设置成功
			 * @public
			 */
		this.setSentStatus = function(_sentStatus) {
			return !!(sentstatus = _sentStatus);
		};
		/**
		 * 设置最后一条消息消息发送时间的时间戳.
		 *@param {number} _sentTime 时间戳
		 * @public
		 */
		this.setSentTime = function(_sentTime) {
			latestTime = senttime = _sentTime;
		};
		/**
		 * 设置目标ID.
		 * @param {string} _targetId 目标ID
		 * @public
		 */
		this.setTargetId = function(_targetId) {
			targetid = _targetId;
		};
		/**
		 * 设置置顶.
		 * @public
		 */
		this.setTop = function() {
			if (!self.getTargetId())
				return;
			var list = RongIMClient.getInstance().getConversationList(),
				_index = -1,
				val = RongIMClient.getInstance().getIO().util.filter(list, function(item, i) {
					if (item.getTargetId() == self.getTargetId()) {
						_index = i;
						return true;
					}
					return false;
				})[0] || this;
			if (_index != 0) {
				_index > 0 ? val = list.splice(_index, 1)[0] : void 0;
				list.unshift(val);
			}
			RongIMClient.getInstance().removeConversationListCache();
		};
		/**
		 * 设置该会话未读消息数.
		 *@param {number} count 未读消息数
		 * @public
		 */
		this.setUnreadMessageCount = function(count) {
			unreadmessagecount = count;
		}
	};
	/**
	 * 文本消息类.
	 * @exports RongIMClient.TextMessage
	 * @class RongIMClient.TextMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.TextMessage = function() {
		RongIMClient.RongIMMessage.call(this);
		this.setMessageType(RongIMClient.MessageType.TextMessage);
		this.setObjectName("RC:TxtMsg");
		/**
		 * 获得所有消息内容
		 * @return {object} 所有消息内容
		 * @throw {Error} Missing fields
		 * @public
		 */
		this.getDetail = function() {
			var val = this.getDetails();
			if ("content" in val)
				return val;
			else
				throw new Error("Missing fields");
		}
	};
	RongIMClient.TextMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.TextMessage.prototype.constructor = RongIMClient.TextMessage;
	/**
	 * 图片消息类.
	 * @exports  RongIMClient.ImageMessage
	 * @class  RongIMClient.ImageMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.ImageMessage = function() {
		RongIMClient.RongIMMessage.call(this);
		this.setMessageType(RongIMClient.MessageType.ImageMessage);
		this.setObjectName("RC:ImgMsg");
		/**
		 * 设置图片URI
		 * @param {object} uri 所有消息内容
		 * @public
		 */
		this.setImageUri = function(uri) {
			this.setContent(uri, "imageUri");
		};
		/**
		 * 得到图片URI
		 * @return {string} 图片URI
		 * @public
		 */
		this.getImageUri = function() {
			return this.getDetails()["imageUri"];
		};
		/**
		 * 获得所有消息内容
		 * @return {object} 所有消息内容
		 * @throw {Error} Missing fields
		 * @public
		 */
		this.getDetail = function() {
			var val = this.getDetails();
			if ("content" in val && "imageUri" in val)
				return val;
			else
				throw new Error("Missing fields");
		}
	};
	RongIMClient.ImageMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.ImageMessage.prototype.constructor = RongIMClient.ImageMessage;
	/**
	 * 富文本消息类.
	 * @exports RongIMClient.RichContentMessage
	 * @class RongIMClient.RichContentMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.RichContentMessage = function() {
		RongIMClient.RongIMMessage.call(this);
		this.setMessageType(RongIMClient.MessageType.RichContentMessage);
		this.setObjectName("RC:ImgTextMsg");
		/**
		 * 获得所有消息内容
		 * @throw {Error} Missing Fields
		 * @public
		 */
		this.getDetail = function() {
			throw new Error("Missing Fields");
		}
	};
	RongIMClient.RichContentMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.RichContentMessage.prototype.constructor = RongIMClient.RichContentMessage;
	/**
	 * 音频消息类.
	 * @exports RongIMClient.VoiceMessage
	 * @class RongIMClient.VoiceMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.VoiceMessage = function() {
		RongIMClient.RongIMMessage.call(this);
		this.setObjectName("RC:VcMsg");
		this.setMessageType(RongIMClient.MessageType.VoiceMessage);
		/**
		 * 设置音频持续时间
		 * @param {number} duration 音频持续时间
		 * @public
		 */
		this.setDuration = function(duration) {
			this.setContent(duration, "duration")
		};
		/**
		 * 获得音频持续时间
		 * @return {number} 音频持续时间
		 * @public
		 */
		this.getDuration = function() {
			return this.getDetails()["duration"];
		};
		/**
		 * 获得所有消息内容
		 * @return {object} 所有消息内容
		 * @throws {Error} Missing fields
		 * @public
		 */
		this.getDetail = function() {
			var val = this.getDetails();
			if ("content" in val && "duration" in val)
				return val;
			else
				throw new Error("Missing fields");
		}
	};
	RongIMClient.VoiceMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.VoiceMessage.prototype.constructor = RongIMClient.VoiceMessage;
	/**
	 * 客服握手消息类.
	 * @exports RongIMClient.HandshakeMessage
	 * @class RongIMClient.HandshakeMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.HandshakeMessage = function() {
		RongIMClient.RongIMMessage.call(this);
		this.setMessageType(RongIMClient.MessageType.HandshakeMessage);
		this.setObjectName("RC:HsMsg");
		/**
		 * 获得所有消息内容
		 * @return {object} 所有消息内容
		 * @public
		 */
		this.getDetail = function() {
			return this.getDetails();
		}
	};
	RongIMClient.HandshakeMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.HandshakeMessage.prototype.constructor = RongIMClient.HandshakeMessage;
	/**
	 * 挂起本次通话消息类.
	 * @exports RongIMClient.SuspendMessage
	 * @class RongIMClient.SuspendMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.SuspendMessage = function() {
		RongIMClient.RongIMMessage.call(this);
		this.setMessageType(RongIMClient.MessageType.SuspendMessage);
		this.setObjectName("RC:SpMsg");
		/**
		 * 获得所有消息内容
		 * @return {object} 所有消息内容
		 * @public
		 */
		this.getDetail = function() {
			return this.getDetails();
		}
	};
	RongIMClient.SuspendMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.SuspendMessage.prototype.constructor = RongIMClient.SuspendMessage;
	/**
	 * 未知消息类.
	 * @exports RongIMClient.UnknownMessage
	 * @class RongIMClient.UnknownMessage.
	 * @extends RongIMClient.RongIMMessage
	 * @constructor
	 */
	RongIMClient.UnknownMessage = function(c) {
		RongIMClient.RongIMMessage.call(this, c);
		this.setMessageType(RongIMClient.MessageType.UnknownMessage);
		this.setObjectName("unknown");
		/**
		 * 获得所有消息内容
		 * @return {object} 所有消息内容
		 * @public
		 */
		this.getDetail = function() {
			return this.getDetails();
		}
	};
	RongIMClient.UnknownMessage.prototype = new RongIMClient.RongIMMessage();
	RongIMClient.UnknownMessage.prototype.constructor = RongIMClient.UnknownMessage;
	/**
	 * 消息内容处理类.
	 * @param {RongIMClient.RongIMMessage} message 需要处理的消息对象
	 * @exports RongIMClient.MessageContent
	 * @class RongIMClient.MessageContent.
	 * @constructor
	 */
	RongIMClient.MessageContent = function(message) {
		var _msg = message,
			handler = function(objectname, detail, extra) {
				var msg = new Modules.UpStreamMessage();
				msg.setSessionId(0);
				msg.setClassname(objectname);
				msg.setContent(RongIMClient.getInstance().getIO().util.JSONStringify(detail));
				window.bala = msg.getContent();
				window.ba = detail;
				if (extra)
					msg.setPushText(extra);
				return RongIMClient.getInstance().getIO().util.arrayFrom(new Int8Array(msg.toArrayBuffer()));
			};
		/**
		 * 正在处理的消息对象
		 * @return {RongIMClient.RongIMMessage}
		 * @public
		 */
		this.getMessage = function() {
			return _msg;
		};
		/**
		 * 将消息对象的内容处理为二进制数组
		 * @return {Array} 二进制数组
		 * @public
		 */
		this.encode = function() {
			return handler(_msg.getObjectName(), _msg.getDetail(), _msg.getExtra());
		}
	};
	/**
	 * 消息上传预处理类（例如发送图片显示的缩略图）.
	 * @param {function} _process 处理函数
	 * @exports RongIMClient.MessageHandler
	 * @class RongIMClient.MessageHandler.
	 * @throws {Error} Wrong parameter
	 * @constructor
	 */
	RongIMClient.MessageHandler = function(_process) {
		if (typeof _process == "function") {
			this.process = _process;
		} else {
			throw new Error("Wrong parameter")
		}
	};
	/**
	 * 设置调试选项类.
	 * @exports RongIMClient.Options
	 * @class RongIMClient.Options.
	 * @constructor
	 */
	RongIMClient.Options = function() {
		var enable = false;
		/**
		 * 获取是否开启调试模式
		 * @public
		 */
		this.isEnableDebug = function() {
			return enable;
		};
		/**
		 * 设置是否开启调试模式
		 * @param {boolean} _enable 是否开启调试
		 * @public
		 */
		this.setEnableDebug = function(_enable) {
			enable = !!_enable;
		}
	};
	/**
	 * 接收到的消息的状态类.
	 * @param {number} _flag 状态标识码
	 * @exports RongIMClient.ReceivedStatus
	 * @class RongIMClient.ReceivedStatus.
	 * @constructor
	 */
	RongIMClient.ReceivedStatus = function(_flag) {
		var flag = _flag || 0;
		/**
		 * 获取状态标识
		 * @public
		 */
		this.getFlag = function() {
			return flag;
		};
		/**
		 * 是否已经下载
		 * @public
		 */
		this.isDownload = function() {
			return flag == 1;
		};
		/**
		 * 是否已收听
		 * @public
		 */
		this.isListened = function() {
			return flag == 2;
		};
		/**
		 * 是否已读
		 * @public
		 */
		this.isRead = function() {
			return flag == 3;
		};
		/**
		 * 设置文件是否已经下载的状态
		 * @public
		 */
		this.setDownload = function() {
			flag = 1;
		};
		/**
		 * 设置是否已被收听的状态
		 * @public
		 */
		this.setListened = function() {
			flag = 2;
		};
	};
	/**
	 * 用户信息类.
	 * @param {string} _userId 用户id
	 * @param {string} _name 用户名称
	 * @param {string} _portraitUri 用户头像url
	 * @exports RongIMClient.UserInfo
	 * @class RongIMClient.UserInfo.
	 * @constructor
	 */
	RongIMClient.UserInfo = function(_userId, _name, _portraitUri) {
		var userid = _userId,
			name = _name,
			portraitUri = _portraitUri;
		/**
		 * 获得昵称
		 * @public
		 */
		this.getUserName = function() {
			return name;
		};
		/**
		 * 获得头像url
		 * @public
		 */
		this.getPortraituri = function() {
			return portraitUri;
		};
		/**
		 * 获得id
		 * @public
		 */
		this.getUserId = function() {
			return userid;
		};
		/**
		 * 设置昵称
		 * @param {string} _name 所有消息内容
		 * @public
		 */
		this.setUserName = function(_name) {
			name = _name;
		};
		/**
		 * 获得头像url
		 * @param {string} _portraitUri 所有消息内容
		 * @public
		 */
		this.setPortraitUri = function(_portraitUri) {
			portraitUri = _portraitUri;
		};
		/**
		 * 获得id
		 * @param {string} _userid 所有消息内容
		 * @public
		 */
		this.setUserId = function(_userid) {
			userid = _userid;
		};
	};
	/**
	 * 会话通知提醒状态.
	 * @exports RongIMClient.ConversationNotificationStatus
	 */
	RongIMClient.ConversationNotificationStatus = new function() {
		/**
		 * 不做提醒.
		 * @type {object}
		 * @public
		 */
		this.DO_NOT_DISTURB = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 0;
			}
		};
		/**
		 * 提醒.
		 * @type {object}
		 * @public
		 */
		this.NOTIFY = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 1;
			}
		};
	};
	/**
	 * 通过指定状态枚举值设置会话通知提醒状态
	 * @param {number} code 通知状态枚举值
	 * @return {object(getValue)}
	 * @static
	 */
	RongIMClient.ConversationNotificationStatus.setValue = function(code) {
		return {
			getValue: function() {
				return code;
			}
		};
	};
	/**
	 * 会话类型.
	 * @exports RongIMClient.ConversationType
	 */
	RongIMClient.ConversationType = new function() {
		/**
		 * 聊天室.
		 * @type {object}
		 * @public
		 */
		this.CHATROOM = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 0;
			}
		};
		/**
		 * 客服.
		 * @type {object}
		 * @public
		 */
		this.CUSTOMER_SERVICE = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 1;
			}
		};
		/**
		 * 讨论组.
		 * @type {object}
		 * @public
		 */
		this.DISCUSSION = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 2;
			}
		};
		/**
		 * 群.
		 * @type {object}
		 * @public
		 */
		this.GROUP = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 3;
			}
		};
		/**
		 * 私聊.
		 * @type {object}
		 * @public
		 */
		this.PRIVATE = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 4;
			}
		};
		/**
		 * 系统.
		 * @type {object}
		 * @public
		 */
		this.SYSTEM = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 5;
			}
		};
	};
	/**
	 * 通过指定会话类型枚举值设置会话类型
	 * @param {number} code 会话类型枚举值
	 * @return {object(getValue)}
	 * @static
	 */
	RongIMClient.ConversationType.setValue = function(code) {
		return {
			getValue: function() {
				return code;
			}
		};
	};
	/**
	 * 消息发送状态.
	 * @exports RongIMClient.SentStatus
	 */
	RongIMClient.SentStatus = new function() {
		/**
		 * 已销毁.
		 * @type {object}
		 * @public
		 */
		this.DESTROYED = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 0;
			}
		};
		/**
		 * 失败.
		 * @type {object}
		 * @public
		 */
		this.FAILED = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 1;
			}
		};
		/**
		 * 已读.
		 * @type {object}
		 * @public
		 */
		this.READ = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 2;
			}
		};
		/**
		 * 已接收.
		 * @type {object}
		 * @public
		 */
		this.RECEIVED = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 3;
			}
		};
		/**
		 * 发送中.
		 * @type {object}
		 * @public
		 */
		this.SENDING = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 4;
			}
		};
		/**
		 * 已发送.
		 * @type {object}
		 * @public
		 */
		this.SENT = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 5;
			}
		};
	};
	/**
	 * 讨论组邀请状态.
	 * @exports RongIMClient.DiscussionInviteStatus
	 * @ignore
	 */
	RongIMClient.DiscussionInviteStatus = new function() {
		/**
		 * 关闭邀请权限.
		 * @type {object}
		 * @public
		 */
		this.CLOSED = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 0;
			}
		};
		/**
		 * 开放邀请权限.
		 * @type {object}
		 * @public
		 */
		this.OPENED = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 1;
			}
		};
	};
	/**
	 * 媒体类型.
	 * @exports RongIMClient.MediaType
	 */
	RongIMClient.MediaType = new function() {
		/**
		 * 视频.
		 * @type {object}
		 * @public
		 */
		this.AUDIO = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 0;
			}
		};
		/**
		 * 文件.
		 * @type {object}
		 * @public
		 */
		this.FILE = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 1;
			}
		};
		/**
		 * 图片.
		 * @type {object}
		 * @public
		 */
		this.IMAGE = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 2;
			}
		};
		/**
		 * 音频.
		 * @type {object}
		 * @public
		 */
		this.VIDEO = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 3;
			}
		};
	};
	/**
	 * 消息发送方向.
	 * @exports RongIMClient.MessageDirection
	 */
	RongIMClient.MessageDirection = new function() {
		/**
		 * 接收方.
		 * @type {object}
		 * @public
		 */
		this.RECEIVE = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 0;
			}
		};
		/**
		 * 发送方.
		 * @type {object}
		 * @public
		 */
		this.SEND = {
			/**
			 * 返回当前状态值.
			 * @type {number}
			 * @public
			 */
			getValue: function() {
				return 1;
			}
		};
	};
	/**
	 * 通过指定消息方向枚举值设置消息方向
	 * @param {number} code 消息方向枚举值
	 * @return {object(getValue)}
	 * @static
	 */
	RongIMClient.MessageDirection.setValue = function(code) {
			return {
				/**
				 * 返回当前状态值.
				 * @type {number}
				 * @public
				 */
				getValue: function() {
					return code;
				}
			};
		}
		/**
		 * 消息类型.
		 * @exports RongIMClient.MessageType
		 */
	RongIMClient.MessageType = {
		/**
		 * 文本消息类型.
		 * @type {string}
		 * @static
		 */
		TextMessage: "txt",
		/**
		 * 图片消息类型.
		 * @type {string}
		 * @static
		 */
		ImageMessage: "img",
		/**
		 * 音频消息类型.
		 * @type {string}
		 * @static
		 */
		VoiceMessage: "voice",
		/**
		 * 图文消息类型.
		 * @type {string}
		 * @static
		 */
		RichContentMessage: "txtimg",
		/**
		 * 客服握手消息类型.
		 * @type {string}
		 * @static
		 */
		HandshakeMessage: "handshake",
		/**
		 * 未知消息类型.
		 * @type {string}
		 * @static
		 */
		UnknownMessage: "unknown",
		/**
		 * 挂起本次回话消息类型.
		 * @type {string}
		 * @static
		 */
		SuspendMessage: "suspendMessage"
	}
})(window);

(function(win) {
	if (win.RongIMClient) {
		/**
		 * 音频处理帮助类，使用的前提是必须引用RongIMClient.min.js;
		 * @exports RongIMClient.Voice
		 * @see <a href="http://res.websdk.rong.io/RongIMClient.voice.min.js">引用地址</a >.
		 */
		win.RongIMClient.voice = new function() {
			var isinit = false;
			/**
			 * Voice帮助类初始化.Warning:ie内核版本暂不支持此功能
			 * @return {boolean} 是否初始化成功
			 * @public
			 */
			this.init = function() {};
			/**
			 * 播放音频消息内容.
			 * @param {string(base64)} DataURL 音频内容
			 * @param {number=} duration 音频持续时间
			 * @throws {error} the voice is not init,please init;WARNING:IE core is not supported This feature
			 * @public
			 */
			this.play = function(DataURL, duration) {};
			/**
			 * 播放进程处理.根据播放时长，每一秒执行一次该事件
			 * @public
			 */
			this.onprogress = function() {};
		};
	} else {
		throw new Error("Please load RongIMClient.min.js,http://res.websdk.rong.io/RongIMClient.min.js");
	}
})(window);

(function(b) {
	if (b.RongIMClient) {
		/**
		 * 表情帮助类，使用的前提是必须引用RongIMClient.min.js；
		 * @exports RongIMClient.Expression
		 * @see <a href="http://res.websdk.rong.io/RongIMClient.emoji.min.js">引用地址</a >.
		 */
		b.RongIMClient.Expression = new function() {
			/**
			 * 得到指定数量的表情对象.
			 * @param {number} h 数量
			 * @param {number} f 从哪儿开始取
			 * @throw  {Error} "Wrong paramter"
			 * @return {Array}
			 * @public
			 */
			this.getAllExpression = function(h, f) {};
			/**
			 * 根据标志符内容得到表情对象.
			 * @param {string} e 音频内容
			 * @param {number=} duration 标志符内容
			 * @return {object(englishName,chineseName,img,tag)}
			 * @public
			 */
			this.getEmojiByContent = function(e) {};
			/**
			 * 根据表情转译后的UTF-16计算出表情tag.如果不是表情就源码返回
			 * @param {string} d UTF-16
			 * @return {string} 表情tag
			 * @public
			 */
			this.calcUTF = function(d) {};
			/**
			 * 根据表情的englishname或者chinesename得到表情对象.没有则返回空对象
			 * @param {string} d englishname or chinesename
			 * @return {object(content,englishname,chinesename,tag)} 表情对象
			 * @public
			 */
			this.getEmojiObjByEnglishNameOrChineseName = function(d) {};
			/**
			 * 检索一段字符串并根据回调函数处理表情对象.
			 * @param {string} g 需要筛选的字符串
			 * @param {function} _callbakc 回调函数 该回调函数接收一个表情对象
			 * @return {string}
			 * @public
			 */
			this.retrievalEmoji = function(g, _callbakc) {};
		};
	} else {
		throw new Error("Please load RongIMClient.min.js,http://res.websdk.rong.io/RongIMClient.min.js")
	}
})(window);