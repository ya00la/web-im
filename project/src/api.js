var React = require("react");
var ReactDOM = require('react-dom');
var Webim = require('./components/webim');
var textMsg = require('./components/message/txt');
var imgMsg = require('./components/message/img');
var locMsg = require('./components/message/loc');
var Notify = require('./components/common/notify');


module.exports = {
    log: function () {
        if (typeof window === 'object') {
            if (typeof console !== 'undefined' && typeof console.log === 'function') {
                console.log.apply(console, arguments);
            }
        }
    },

    render: function (node, change) {
        this.node = node;

        var props = {};
        switch (change) {
            case 'roster':
                props.rosterChange = true;
                break;
            case 'group':
                props.groupChange = true;
                break;
            case 'chatroom':
                props.chatroomChange = true;
                break;
            case 'stranger':
                props.strangerChange = true;
                break;
            default:
                props = null;
                break;
        }
        if (props) {
            ReactDOM.render(<Webim config={WebIM.config} close={this.logout} {...props} />, this.node);
        } else {
            // 跳转到登录
            ReactDOM.render(<Webim config={WebIM.config} close={this.logout}/>, this.node);
        }
    },

    logout: function (type) {
        if (WebIM.config.isWindowSDK) {
            WebIM.doQuery('{"type":"logout"}',
                function (response) {
                    Demo.api.init();
                },
                function (code, msg) {
                    Demo.api.NotifyError("logout:" + msg);
                });
        } else {
            window.location.href = '#';
            Demo.conn.close('logout');
            if (type == WebIM.statusCode.WEBIM_CONNCTION_CLIENT_LOGOUT) {
                Demo.conn.errorType = type;
            }
        }
    },

    init: function () {
        Demo.selected = null;
        // Demo.user = null;
        Demo.nickname = null;
        Demo.header = null;
        Demo.call = null;
        Demo.roster = {};
        Demo.strangers = {};
        Demo.selectedCate = 'groups';
        Demo.chatState.clear();
        if (Demo.currentChatroom) {
            delete Demo.chatRecord[Demo.currentChatroom];
        }
        ReactDOM.unmountComponentAtNode(this.node); // 移除node后再重新render
        this.render(this.node);
    },

    addToChatRecord: function (msg, type, status) {
        var data = msg.data || msg.msg || '';
        var brief = this.getBrief(data, type);
        var id = msg.id;
        this.sentByMe = msg.from === Demo.user;
        var targetId = this.sentByMe || msg.type !== 'chat' ? msg.to : msg.from;
        if (!Demo.chatRecord[targetId] || !Demo.chatRecord[targetId].messages) {
            Demo.chatRecord[targetId] = {};

            Demo.chatRecord[targetId].messages = [];

        } else if (Demo.chatRecord[targetId].messages.length >= Demo.maxChatRecordCount) {

            Demo.chatRecord[targetId].messages.shift();

        }
        Demo.chatRecord[targetId].brief = brief;
        Demo.chatRecord[targetId].briefType = type;

        Demo.chatRecord[targetId].messages[id] = {message: msg, type: type, status: status};
    },

    releaseChatRecord: function (targetId) {
        var targetId = targetId || Demo.selected;
        if (Demo.first) {
            Demo.first = false;
            for (var i in Demo.chatRecord) {
                targetId = i;
                if (Demo.chatRecord[targetId] && Demo.chatRecord[targetId].messages) {
                    if (document.getElementById('wrapper' + targetId))
                        document.getElementById('wrapper' + targetId).innerHTML = '';
                    for (var i in Demo.chatRecord[targetId].messages) {
                        if (Demo.chatRecord[targetId].messages[i] == undefined)
                            continue;
                        if (!Demo.chatRecord[targetId].messages[i].read) {
                            Demo.api.appendMsg(Demo.chatRecord[targetId].messages[i].message,
                                Demo.chatRecord[targetId].messages[i].type,
                                Demo.chatRecord[targetId].messages[i].status,
                                i);
                        }
                    }
                }
            }
            return;
        }
        if (targetId) {
            if (Demo.chatRecord[targetId] && Demo.chatRecord[targetId].messages) {
                if (document.getElementById('wrapper' + targetId))
                    document.getElementById('wrapper' + targetId).innerHTML = '';
                for (var i in Demo.chatRecord[targetId].messages) {
                    if (Demo.chatRecord[targetId].messages[i] == undefined)
                        continue;
                    Demo.chatRecord[targetId].messages[i].read = true;
                    Demo.api.sendRead(Demo.chatRecord[targetId].messages[i].message);
                    Demo.api.appendMsg(Demo.chatRecord[targetId].messages[i].message,
                        Demo.chatRecord[targetId].messages[i].type,
                        Demo.chatRecord[targetId].messages[i].status,
                        i);
                }
            }
        }
    },

    sendRead: function (message) {
        if (!WebIM.config.read)
            return;
        // 阅读消息时反馈一个已阅读
        var msgId = Demo.conn.getUniqueId();
        var bodyId = message.id;
        var msg = new WebIM.message('read', msgId);
        msg.set({
            id: bodyId
            , to: message.from
        });
        Demo.conn.send(msg.body);

    },

    getBrief: function (data, type) {
        var brief = '';
        switch (type) {
            case 'txt':
                brief = WebIM.utils.parseEmoji(this.encode(data).replace(/\n/mg, ''));
                break;
            case 'emoji':
                for (var i = 0, l = data.length; i < l; i++) {
                    brief += data[i].type === 'emoji'
                        ? '<img src="' + WebIM.utils.parseEmoji(this.encode(data[i].data)) + '" />'
                        : this.encode(data[i].data);
                }
                break;
            case 'img':
                brief = '[' + Demo.lan.image + ']';
                break;
            case 'cmd':
                brief = '[' + Demo.lan.cmd + ']';
                break;
            case 'loc':
                brief = '[' + Demo.lan.location + ']';
                break;
        }
        return brief;
    },

    appendMsg: function (msg, type, status, nid) {
        if (Demo.first) {
            return;
        }
        if (!msg || type === 'cmd') {
            return;
        }
        msg.from = msg.from || Demo.user;
        msg.type = msg.type || 'chat';

        this.sentByMe = msg.from === Demo.user;
        var brief = '',
            data = msg.data || msg.msg || '',
            name = this.sendByMe ? Demo.nickname : msg.ext.nick,
            targetId = this.sentByMe || msg.type !== 'chat' ? msg.to : msg.from;
        var targetNode = document.getElementById('wrapper' + targetId);

        var isStranger = !document.getElementById(targetId) && !document.getElementById('wrapper' + targetId);

        // TODO: ios/android client doesn't encodeURIComponent yet
        if (typeof data === "string" && WebIM.config.isWindowSDK) {
            data = decodeURIComponent(data);
        }
        if (!this.sentByMe && msg.type === 'chat' && isStranger) {
            Demo.strangers[targetId] = Demo.strangers[targetId] || [];
        } else if (isStranger) {
            return;
        }
        if (isStranger) {
            Demo.strangers[targetId].push({msg: msg, type: type});
            this.render(this.node, 'stranger');
            return;
        } else {
            brief = this.getBrief(data, type);
            if (targetNode) {
                switch (type) {
                    case 'txt':
                        textMsg({
                            wrapper: targetNode,
                            name: name,
                            avatar: msg.ext.header,
                            value: brief,
                            error: msg.error,
                            errorText: msg.errorText,
                            id: msg.id,
                            status: status,
                            nid: nid
                        }, this.sentByMe);
                        break;
                    case 'emoji':
                        textMsg({
                            wrapper: targetNode,
                            name: name,
                            avatar: msg.ext.header,
                            value: brief,
                            error: msg.error,
                            errorText: msg.errorText,
                            id: msg.id,
                            status: status,
                            nid: nid
                        }, this.sentByMe);
                        break;
                    case 'img':
                        if (WebIM.config.isWindowSDK) {
                            var cur = document.getElementById('file_' + msg.id);
                            if (cur) {
                                var listenerName = 'onUpdateFileUrl' + msg.id;
                                if (Demo.api[listenerName]) {
                                    Demo.api[listenerName]({url: msg.url});
                                    Demo.api[listenerName] = null;
                                } else {
                                    console.log('listenerName not exists:' + msg.id);
                                }
                                return;
                            } else {
                                brief = '[' + Demo.lan.image + ']';
                                imgMsg({
                                    id: msg.id,
                                    wrapper: targetNode,
                                    name: name,
                                    avatar: msg.ext.header,
                                    value: data || msg.url,
                                    error: msg.error,
                                    errorText: msg.errorText,
                                    status: status
                                }, this.sentByMe);
                            }
                        } else {
                            imgMsg({
                                id: msg.id,
                                wrapper: targetNode,
                                name: name,
                                avatar: msg.ext.header,
                                value: data || msg.url,
                                error: msg.error,
                                errorText: msg.errorText,
                                status: status,
                                nid: nid
                            }, this.sentByMe);
                        }
                        break;
                    case 'cmd':
                        break;
                    case 'loc':
                        locMsg({
                            wrapper: targetNode,
                            name: name,
                            avatar: msg.ext.header,
                            value: data || msg.addr,
                            error: msg.error,
                            errorText: msg.errorText
                        }, this.sentByMe);
                        break;
                    default:
                        break;
                }
            }
        }

        // show brief
        this.appendBrief(targetId, brief);

        if (msg.type === 'cmd') {
            return;
        }
        // show count
        var cate = '';
        switch (msg.type) {
            case 'chat':
                if (this.sentByMe) {
                    return;
                }
                var contact = document.getElementById(msg.from);
                cate = Demo.roster[msg.from] ? 'friends' : 'strangers';

                this.addCount(msg.from, cate);
                break;
            case 'groupchat':
                cate = msg.roomtype ? msg.roomtype : 'groups';

                this.addCount(msg.to, cate);
                break;
        }
    },

    appendBrief: function (id, value) {
        var cur = document.getElementById(id);
        if (!cur)
            return;
        cur.querySelector('em').innerHTML = value;
    },
    // 消息没有读时显示红点
    addCount: function (id, cate) {

        // Do not add a count to an opened chat window
        // TODO: don't handle dom directly,use react way.
        if (Demo.selectedCate !== cate) {
            // This is red dot on the cate
            var curCate = document.getElementById(cate).getElementsByTagName('i')[1];
            curCate.style.display = 'block';
            var curCateCount = curCate.getAttribute('data-count') / 1;

            // Don't increase the count of the cate if an opened item got messages
            if (Demo.chatState[cate].selected != id) {

                curCateCount++;

                // This is the red dot on the items
                var cur = document.getElementById(id).getElementsByTagName('i')[0];
                var curCount = cur.getAttribute('data-count') / 1;
                curCount++;
                cur.setAttribute('data-count', curCount);
                Demo.chatRecord[id].count = curCount;
                cur.innerText = curCount > 999 ? '...' : curCount + '';
                cur.style.display = 'block';
            }

            curCate.setAttribute('data-count', curCateCount);
            Demo.chatState[cate].count = curCateCount;

        } else {
            if (Demo.selected !== id) {
                var curCate = document.getElementById(cate).getElementsByTagName('i')[1];
                curCate.style.display = 'block';
                var curCateCount = curCate.getAttribute('data-count') / 1;
                curCateCount++;
                curCate.setAttribute('data-count', curCateCount);
                Demo.chatState[cate].count = curCateCount;
            }
            if (!this.sentByMe && id !== Demo.selected) {
                var cur = document.getElementById(id).getElementsByTagName('i')[0];
                var curCount = cur.getAttribute('data-count') / 1;
                curCount++;
                cur.setAttribute('data-count', curCount);
                Demo.chatRecord[id].count = curCount;
                cur.innerText = curCount > 999 ? '...' : curCount + '';
                cur.style.display = 'block';
            }
        }

    },

    encode: function (str) {
        if (!str || str.length === 0) {
            return '';
        }
        var s = '';
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/<(?=[^o][^)])/g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/\"/g, "&quot;");
        s = s.replace(/\n/g, "<br>");
        return s;
    },
    NotifyError: function (msg) {
        Notify.error(msg);
    },
    NotifySuccess: function (msg) {
        Notify.success(msg);
    },
    scrollIntoView: function (node) {
        setTimeout(function () {
            node.scrollIntoView(true);
        }, 50);
    },
    listen: function (options) {
        for (var key in options) {
            this[key] = options[key];
        }
    },
    pagesize: 20
};


