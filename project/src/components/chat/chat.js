var React = require("react");
var ChatWindow = require('../chat/chatWindow');
var ConfirmPop = require('./confirmPop');

module.exports = React.createClass({

    // Switch the left bar doesn't release chat records
    release: true,

    getInitialState: function () {
        var me = this;

        var uri = WebIM.utils.parseHrefHash();
        var curNode = Demo.sellerID; //uri.curNode;
        var windows = [];
        if (curNode) {
            Demo.selected = curNode;
            // if (Demo.chatState['friends']) {
            //     while (Demo.chatState['friends'].chatWindow.length) {
            //         Demo.chatState['friends'].chatWindow.pop();
            //     }
            // }
            var props = {
                sendPicture: this.sendPicture,
                sendAudio: this.sendAudio,
                sendFile: this.sendFile,
                name: curNode
            };
            Demo.chatState['strangers'].chatWindow.push(
                <ChatWindow id={'wrapper' + curNode}
                            key={curNode}
                            {...props}
                            chatType='singleChat'
                            updateNode={this.updateNode}
                            className={''}/>
            );
            windows = Demo.chatState['strangers'].chatWindow;
        }


        Demo.conn.listen({
            onUpdateMyRoster: function (options) {
                me.updateMyRoster(options);
            },
            onUpdateMyGroupList: function (options) {
                me.updateMyGroupList(options);
            },
            onConfirmPop: function (options) {
                me.confirmPop(options);
            },
            onOpened: function () {
                console.error('I have already come in====' + new Date())
                me.props.update({
                    signIn: false,
                    signUp: false,
                    chat: true,
                    loadingStatus: 'hide'
                });

            
              //  初始化成一进来就直接进入陌生人聊天窗口
                Demo.conn.errorType = -1;
                var strangerID = Demo.sellerID
                Demo.strangers = {strangerID:[{msg:{data: "", error: false, errorCode: "", errorText: "", ext: {nick:Demo.sellerName},from:Demo.userID,to:Demo.sellerID,type:'chat'},text:''}]}
                this.setState({strangers: [{name:Demo.sellerID,nick:Demo.sellerName}]})
                setTimeout(this.updateNode, 5000);
            },
            onClosed: function (msg) {
                Demo.first = true;
                // Demo.api.logout();
            },
            onTextMessage: function (message) {
                if (WebIM.config.isWindowSDK) {
                    message = eval('(' + message + ')');
                }

                Demo.api.addToChatRecord(message, 'txt');
                Demo.api.appendMsg(message, 'txt');

                if (Demo.selected == message.from) {
                    var id = message.id,
                        sentByMe = message.from === Demo.user;
                    var targetId = sentByMe || message.type !== 'chat' ? message.to : message.from;
                    Demo.chatRecord[targetId].messages[id].read = true;
                    // 发送已读回执
                    Demo.api.sendRead(message);
                }
            },
            onEmojiMessage: function (message) {
                if (WebIM.config.isWindowSDK) {
                    message = eval('(' + message + ')');
                }
                Demo.api.addToChatRecord(message, 'emoji');
                Demo.api.appendMsg(message, 'emoji');

                if (Demo.selected == message.from) {
                    var id = message.id,
                        sentByMe = message.from === Demo.user;
                    var targetId = sentByMe || message.type !== 'chat' ? message.to : message.from;
                    Demo.chatRecord[targetId].messages[id].read = true;
                    // 发送已读回执
                    Demo.api.sendRead(message);
                }
            },
            onPictureMessage: function (message) {
                if (WebIM.config.isWindowSDK) {
                    message = eval('(' + message + ')');
                }

                Demo.api.addToChatRecord(message, 'img');
                Demo.api.appendMsg(message, 'img');
                if (Demo.selected == message.from) {
                    var id = message.id,
                        sentByMe = message.from === Demo.user;
                    var targetId = sentByMe || message.type !== 'chat' ? message.to : message.from;
                    Demo.chatRecord[targetId].messages[id].read = true;
                    // 发送已读回执
                    Demo.api.sendRead(message);
                }
            },
            onCmdMessage: function (message) {
                if (WebIM.config.isWindowSDK) {
                    message = eval('(' + message + ')');
                }
                Demo.api.addToChatRecord(message, 'cmd');
                Demo.api.appendMsg(message, 'cmd');
                if (Demo.selected == message.from) {
                    var id = message.id,
                        sentByMe = message.from === Demo.user;
                    var targetId = sentByMe || message.type !== 'chat' ? message.to : message.from;
                    Demo.chatRecord[targetId].messages[id].read = true;
                    // 发送已读回执
                    Demo.api.sendRead(message);
                }
            },
            onLocationMessage: function (message) {
                if (WebIM.config.isWindowSDK) {
                    message = eval('(' + message + ')');
                }

                Demo.api.addToChatRecord(message, 'loc');
                Demo.api.appendMsg(message, 'loc');
                if (Demo.selected == message.from) {
                    var id = message.id,
                        sentByMe = message.from === Demo.user;
                    var targetId = sentByMe || message.type !== 'chat' ? message.to : message.from;
                    Demo.chatRecord[targetId].messages[id].read = true;
                    // 发送已读回执
                    Demo.api.sendRead(message);
                }
            },
            onOnline: function () {
                // log(WebIM.utils.ts(), 'online');
            },
            onOffline: function () {
                if (WebIM.config.isWindowSDK) {
                    Demo.api.NotifyError("Network connection is broken. reconnecting...");
                } else {
                    //webRTC:断线处理
                    // if (WebIM.config.isWebRTC) {
                    //     var closeButton = document.getElementById('webrtc_close');
                    //     closeButton && closeButton.click();
                    // }
                    Demo.api.logout(WebIM.statusCode.WEBIM_CONNCTION_CLIENT_OFFLINE);
                }
            },
            onError: function (message) {
                var text = '';
                if (WebIM.config.isWindowSDK) {
                    message = eval('(' + message + ')');
                    text = message.desc;
                    if (message.code == '206') {
                        Demo.api.logout();
                    }
                    //do nothing
                } else {
                    if (message.type == WebIM.statusCode.WEBIM_CONNCTION_DISCONNECTED) {
                        if (Demo.conn.autoReconnectNumTotal < Demo.conn.autoReconnectNumMax) {
                            Demo.conn.errorType = message.type;
                            return;
                        }
                    }
                    if (message.data && message.data.data) {
                        text = message.data.data;
                    } else {
                        text = WebIM.utils.getObjectKey(WebIM.statusCode, message.type) + ' ' + ' type=' + message.type;
                    }
                }
                if (Demo.conn.errorType != WebIM.statusCode.WEBIM_CONNCTION_CLIENT_LOGOUT) {
                    if (message.type === WebIM.statusCode.WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP
                        ||
                        message.type === WebIM.statusCode.WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP
                        ||
                        message.type === WebIM.statusCode.WEBIM_CONNECTION_ACCEPT_JOIN_GROUP
                        ||
                        message.type === WebIM.statusCode.WEBIM_CONNECTION_DECLINE_JOIN_GROUP
                        ||
                        message.type === WebIM.statusCode.WEBIM_CONNECTION_CLOSED) {
                        Demo.api.NotifySuccess(text);
                        return;
                    } else {
                        if (text == 'logout' || text == 'WEBIM_CONNCTION_SERVER_ERROR  type=8') {
                            text = Demo.lan.logoutSuc;
                            window.location.href = '#'
                            Demo.api.NotifySuccess(text);
                        } else {
                            Demo.api.NotifyError('onError:' + text);
                        }
                    }
                }

                //webRTC:断线处理
                // if (WebIM.config.isWebRTC) {
                //     var closeButton = document.getElementById('webrtc_close');
                //     closeButton && closeButton.click();
                // }
                Demo.api.init();
            },
            onReceivedMessage: function (message) {
                var msg = document.getElementById(message.id);
                if (msg) {
                    msg.setAttribute('name', message.mid);
                }
                for (var targetId in Demo.chatRecord) {
                    var msg = Demo.chatRecord[targetId].messages[message.id];
                    Demo.chatRecord[targetId].messages[message.mid] = msg;
                    delete Demo.chatRecord[targetId].messages[message.id];
                }
            },
            onDeliveredMessage: function (message) {
                var msg = document.getElementsByName(message.mid);
                // 记录消息的状态
                for (var targetId in Demo.chatRecord) {
                    if (Demo.chatRecord[targetId].messages[message.mid]
                        && Demo.chatRecord[targetId].messages[message.mid].status != 'Read') {
                        if (msg) {
                            if (msg[0])
                                msg[0].innerHTML = '已送达';
                        }
                        Demo.chatRecord[targetId].messages[message.mid].status = 'Delivered';
                    }
                }
            },
            onReadMessage: function (message) {
                var msg = document.getElementsByName(message.mid);
                if (msg) {
                    if (msg[0]) {
                        msg[0].innerHTML = '已读';
                    }
                }
                // 记录消息的状态
                for (var targetId in Demo.chatRecord) {
                    if (Demo.chatRecord[targetId].messages[message.mid]) {
                        Demo.chatRecord[targetId].messages[message.mid].status = 'Read';
                    }
                }
            }
        });

        return {
            cur: 'stranger',  //默认显示群组
            curNode: curNode || '',
            friends: [],
            groups: [],
            chatrooms: [],
            strangers: [],
            blacklist: {},
            chatrooms_totalnum: Demo.api.pagesize,
            contact_loading_show: false,
            windows: windows
        };
    },

    confirmPop: function (options) {
        ConfirmPop.show(options);
    },
    componentDidUpdate: function (prevProps, prevState) {
        // for (var o in Demo.strangers) {
        //     if (Demo.strangers.hasOwnProperty(o)) {
        //         var msg = null;
        //         while (msg = Demo.strangers[o].pop()) {
        //             Demo.api.addToChatRecord(msg.msg, msg.type);
        //             Demo.api.appendMsg(msg.msg, msg.type);
        //         }
        //     }
        // }
        // if(this.release){
        //     Demo.api.releaseChatRecord();
        // }else{
        //     this.release = true;
        // }
    },
    update: function (cur) {
        var node = Demo.chatState[Demo.selectedCate].selected;
        Demo.selected = node;
        this.setChatWindow(true);
        this.setState({curNode: node, cur: cur, contact_loading_show: false});
    },
    openStrangeChat: function (username) {
        Demo.selectedCate = 'strangers';
        Demo.selected = username;
        this.update('stranger');
        Demo.chatingCate = Demo.selectedCate;
        this.updateNode(Demo.selected);
        // this.getStrangers();
    },
    storeChatWindow: function () {
        var id, cate = '',
            props = {
                sendPicture: this.sendPicture,
                sendAudio: this.sendAudio,
                sendFile: this.sendFile,
                name: ''
            };
        if (Demo.selected) {
            id = Demo.selected;
            cate = Demo.selectedCate;

            // clear this chat window
            while (Demo.chatState[cate].chatWindow.length) {
                Demo.chatState[cate].chatWindow.pop();
            }
            switch (cate) {
                case 'strangers':
                    props.name = id;
                    props.nick = Demo.strangers[id][0].msg.ext.nick;
                    Demo.chatState[cate].chatWindow.push(
                        <ChatWindow id={'wrapper' + id}
                                    key={id}
                                    {...props}
                                    className={''}/>
                    );
                    break;
                default:
                    console.log('Default: ', cate);
            }
        }
    },

    setChatWindow: function (show) {
        var cate = Demo.selectedCate;
        if (!show) {
            this.setState({windows: []});
        } else {
            this.setState({windows: Demo.chatState[cate].chatWindow});
        }
    },
    updateNode: function (cid) {
        console.error('============updateNode=========' + cid)
        console.log(this.state)
        console.error('============updateNode========end=')
        var uri = WebIM.utils.parseHrefHash();
        var username = uri.username;
        this.storeChatWindow();
        this.setChatWindow(true);
    },

    sendPicture: function (chatType) {
        if (WebIM.config.isWindowSDK) {
            this.sendFileImpl("img", chatType);
        } else {
            this.refs.picture.click();
        }
    },

    pictureChange: function () {
        var me = this,
            chatroom = Demo.selectedCate === 'chatrooms',
            file = WebIM.utils.getFileUrl(me.refs.picture),
            url;

        if (!file.filename) {
            me.refs.picture.value = null;
            return false;
        }

        if (!Demo.IMGTYPE[file.filetype.toLowerCase()]) {
            me.refs.picture.value = null;
            Demo.api.NotifyError(Demo.lan.invalidType + ': ' + file.filetype);
            return;
        }

        var uid = Demo.conn.getUniqueId();
        var msg = new WebIM.message('img', uid);

        msg.set({
            apiUrl: Demo.conn.apiUrl,
            file: file,
            to: Demo.selected,
            roomType: chatroom,
            ext: {nick: Demo.nickname},
            onFileUploadError: function (error) {
                me.refs.picture.value = null;
                var option = {
                    data: Demo.lan.sendImageFailed,
                    from: Demo.user,
                    ext: {nick: Demo.nickname},
                    to: Demo.selected
                };
                Demo.api.addToChatRecord(option, 'txt');
                Demo.api.appendMsg(option, 'txt');
            },
            onFileUploadComplete: function (data) {
                url = ((location.protocol != 'https:' && WebIM.config.isHttpDNS) ? (Demo.conn.apiUrl + data.uri.substr(data.uri.indexOf("/", 9))) : data.uri) + '/' + data.entities[0].uuid;
                me.refs.picture.value = null;
                var option = {
                    data: url,
                    from: Demo.user,
                    to: Demo.selected,
                    ext: {nick: Demo.nickname},
                    id: uid
                };
                Demo.api.addToChatRecord(option, 'img');
                Demo.api.appendMsg(option, 'img');
            },
            success: function (id) {
            },
            flashUpload: WebIM.flashUpload
        });

        // if (Demo.selectedCate === 'groups') {
        //     msg.setGroup(Demo.groupType);
        // } else if (chatroom) {
        //     msg.setGroup(Demo.groupType);
        // }

        Demo.conn.send(msg.body);
    },

    sendAudio: function (chatType) {
        if (WebIM.config.isWindowSDK) {
            this.sendFileImpl("aud", chatType);
        } else {
            this.refs.audio.click();
        }
    },

    sendAudioMsg: function (file, duration) {
        var msg = new WebIM.message('audio', Demo.conn.getUniqueId()),
            chatroom = Demo.selectedCate === 'chatrooms',
            url,
            me = this;

        msg.set({
            apiUrl: Demo.conn.apiUrl,
            file: file,
            to: Demo.selected,
            ext: {nick: Demo.nickname},
            roomType: chatroom,
            length: duration || 0,
            onFileUploadError: function (error) {
                me.refs.audio.value = null;

                var option = {
                    data: Demo.lan.sendAudioFailed,
                    from: Demo.user,
                    ext: {nick: Demo.nickname},
                    to: Demo.selected
                };
                Demo.api.addToChatRecord(option, 'txt');
                Demo.api.appendMsg(option, 'txt');
            },
            onFileUploadComplete: function (data) {
                url = ((location.protocol != 'https:' && WebIM.config.isHttpDNS) ? (Demo.conn.apiUrl + data.uri.substr(data.uri.indexOf("/", 9))) : data.uri) + '/' + data.entities[0].uuid;
                me.refs.audio.value = null;
            },
            success: function (id, sid) {
                var option = {
                    data: url,
                    from: Demo.user,
                    to: Demo.selected,
                    ext: {nick: Demo.nickname},
                    id: sid,
                    length: duration
                };
                Demo.api.addToChatRecord(option, 'aud');
                Demo.api.appendMsg(option, 'aud');
            },
            flashUpload: WebIM.flashUpload
        });

        // if (Demo.selectedCate === 'groups') {
        //     msg.setGroup(Demo.groupType);
        // } else if (chatroom) {
        //     msg.setGroup(Demo.groupType);
        // }

        Demo.conn.send(msg.body);
    },

    audioChange: function () {
        var me = this,
            file = WebIM.utils.getFileUrl(me.refs.audio);

        if (!file.filename) {
            me.refs.audio.value = null;
            return false;
        }

        if (!Demo.AUDIOTYPE[file.filetype.toLowerCase()]) {
            me.refs.audio.value = null;
            Demo.api.NotifyError(Demo.lan.invalidType + ': ' + file.filetype);
            return;
        }

        if ((WebIM.utils.getIEVersion === null || WebIM.utils.getIEVersion > 9) && window.Audio) {

            var audio = document.createElement('audio');

            audio.oncanplay = function () {
                me.sendAudioMsg(file, Math.ceil(this.duration));
                audio = null;
            }
            audio.src = file.url;
        }
    },

    sendFile: function (chatType) {
        if (WebIM.config.isWindowSDK) {
            this.sendFileImpl("file", chatType);
        } else {
            this.refs.file.click();
        }
    },
    sendFileImpl: function (type, chatType) {
        var is_chatroom = Demo.selectedCate === 'chatrooms' ? "true" : "false";
        var is_group = (Demo.selectedCate === 'chatrooms' || Demo.selectedCate === 'groups') ? "groupchat" : "singlechat";
        WebIM.doQuery('{"type":"sendFileMessage","to":"' + Demo.selected + '","message_type":"' + type + '","group":"' + is_group + '","chatType":"' + chatType + '","roomType":"' + is_chatroom + '"}',
            function (response) {
                var res = eval('(' + response + ')');

                var url = decodeURI(res.url);
                var pathSplitted = url.split("\\");

                url = url.replace(/\\/ig, "/");
                var fileurl = 'file:///' + url;
                Demo.api.appendMsg({
                    id: res.id,
                    data: fileurl,
                    filename: pathSplitted[pathSplitted.length - 1],
                    from: Demo.user,
                    ext: {nick: Demo.nickname},
                    to: Demo.selected
                }, type);
            },
            function (code, msg) {
                alert(code + " - " + msg);
            });
    },
    fileChange: function () {
        var me = this,
            uid = Demo.conn.getUniqueId(),
            msg = new WebIM.message('file', uid),
            chatroom = Demo.selectedCate === 'chatrooms',
            file = WebIM.utils.getFileUrl(me.refs.file),
            fileSize = WebIM.utils.getFileSize(me.refs.file),
            fileLength = WebIM.utils.getFileLength(me.refs.file),
            filename = file.filename;
            var a=file.filetype.toLowerCase()
            console.error(a)
            console.error(Demo.FILETYPE)
        if (!Demo.FILETYPE[file.filetype.toLowerCase()]) {
            me.refs.file.value = null;
            Demo.api.NotifyError(Demo.lan.invalidType + ': ' + file.filetype);
            return;
        }

        if (!fileSize) {
            Demo.api.NotifyError(Demo.lan.fileOverSize);
            return false;
        }

        if (!file.filename) {
            me.refs.file.value = null;
            return false;
        }

        msg.set({
            apiUrl: Demo.conn.apiUrl,
            file: file,
            filename: filename,
            to: Demo.selected,
            file_length: 3424134,
            roomType: chatroom,
            ext: {
                nick: Demo.nickname,
                fileSize: fileSize,
                file_length: fileLength
            },
            onFileUploadError: function (error) {
                me.refs.file.value = null;
                var option = {
                    data: Demo.lan.sendFileFailed,
                    from: Demo.user,
                    ext: {nick: Demo.nickname},
                    to: Demo.selected
                };
                Demo.api.addToChatRecord(option, 'txt');
                Demo.api.appendMsg(option, 'txt');
            },
            onFileUploadComplete: function (data) {
                var url = ((location.protocol != 'https:' && WebIM.config.isHttpDNS) ? (Demo.conn.apiUrl + data.uri.substr(data.uri.indexOf("/", 9))) : data.uri) + '/' + data.entities[0].uuid;
                me.refs.file.value = null;
                var option = {
                    data: url,
                    filename: filename,
                    from: Demo.user,
                    ext: {nick: Demo.nickname},
                    to: Demo.selected,
                    id: uid
                };
                console.log('FileChange upload completed: ', option);
                console.log('Data: ', data);
                Demo.api.addToChatRecord(option, 'file');
                Demo.api.appendMsg(option, 'file');
            },
            success: function (id) {
            },
            flashUpload: WebIM.flashUpload
        });
        Demo.conn.send(msg.body);
    },

    render: function () {
        return (
            <div className={this.props.show ? 'webim-chat' : 'webim-chat hide'}>
                {this.state.windows}
                <input ref='picture'
                       onChange={this.pictureChange}
                       type='file'
                       className='hide'/>
            </div>
        );
    }
});
