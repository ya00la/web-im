var React = require("react");
var SendWrapper = require('./sendWrapper');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            settings: '',
            admin: 0,
            groupNum: 0,
            groupNotic: '',
            groupName: '',
            owner: [],
            members: [],
            fields: {},
            memberShowStatus: false
        };
    },
    send: function (msg) {
        msg.chatType = this.props.chatType;
        Demo.conn.send(msg);
        Demo.api.addToChatRecord(msg, 'txt', 'Undelivered');
        Demo.api.appendMsg(msg, 'txt');
    },
    componentDidMount: function () {
        Demo.api.releaseChatRecord();
        // this.preListMember()
    },
    openStrangeChat: function (username,user) {
        var username1 = username.toLowerCase();
        var msg={ data:"",
                  error:false,
                  errorCode:"",
                  errorText:"",
                  ext:{nick:user.nick},
                  from:Demo.user,
                  id:"",
                  to:username,
                  type:"chat"
                }
        Demo.strangers[username1] = [];
        Demo.strangers[username1].push({msg:msg,type:'tex'});
        this.props.openStrangeChat(username)
    },
    render: function () {
        var className = this.props.roomId ? ' dib' : ' hide',
            props = {
                chatType: this.props.chatType,
                sendPicture: this.props.sendPicture,
                sendAudio: this.props.sendAudio,
                sendFile: this.props.sendFile
            },
            memberStatus = this.state.memberShowStatus ? '' : ' hide',
            roomMember = [];

        return (
            <div className={'webim-chatwindow ' + this.props.className}>
                <div className='webim-chatwindow-title'>聊天窗口</div>
                <div id={this.props.id}
                     ref='wrapper'
                     style={{width: (Demo.selectedCate == 'chatrooms' || Demo.selectedCate == 'groups') ? '': '100%'}}
                     className='webim-chatwindow-msg'>
                </div>
                <SendWrapper send={this.send}{...props}/>
            </div>
        );
    }
});
