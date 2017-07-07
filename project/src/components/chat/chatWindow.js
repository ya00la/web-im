var React = require("react");
var ReactDOM = require('react-dom');
var SendWrapper = require('./sendWrapper');
var Avatar = require('../common/avatar');
var OperationsGroups = require('./operationsGroups');
var OperationsFriends = require('./operationsFriends');
var apis = require('../../libs/api');

var _ = require('underscore');

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

    getGroupInfo: function (cb_type) {
        //only group window
        if (this.props.chatType == 'groupChat'
            || this.props.chatType == 'chatRoom') {
            var me = this;
            if (WebIM.config.isWindowSDK) {
                WebIM.doQuery('{"type":"groupSpecification","id":"' + me.props.roomId + '"}',
                    function success(str) {
                        if (str == '') {
                            return;
                        }
                        var json = eval('(' + str + ')');
                        var owner = [{jid: json.owner, affiliation: "owner"}];
                        var admin = 0;
                        if (json.owner == Demo.user) {
                            admin = 1;
                        }
                        me.setState({settings: json.style, admin: admin, owner: owner});
                        if (cb_type == 'listMember') {
                            me.listMember();
                        } else {
                            me.refs['operation_div'].refs['switch'].click();
                        }
                    },
                    function failure(errCode, errMessage) {
                        Demo.api.NotifyError("queryRoomInfo:" + errCode + ' ' + errMessage);
                    });

            } else {
                Demo.conn.queryRoomInfo({
                    roomId: me.props.roomId,
                    success: function (settings, members, fields) {
                        if (members && members.length > 0) {
                            var jid = members[0].jid;
                            var username = jid.substr(0, jid.lastIndexOf("@"));
                            var admin = 0;
                            if (members[0].affiliation == 'owner' && username.toLowerCase() == Demo.user) {
                                admin = 1;
                            }
                            me.setState({settings: settings, admin: admin, owner: members, fields: fields});
                            if (cb_type == 'listMember') {
                                me.listMember();
                            } else if (cb_type == 'opertion') {
                                me.refs['operation_div'].refs['switch'].click();
                            }
                        }
                    },
                    error: function () {
                        Demo.api.NotifyError('queryRoomInfo error', me.props.roomId);
                    }
                });
            }
        }
    },


    componentWillReceiveProps: function (nextProps) {

    },

    preListMember: function () {
        if (this.state.owner.length == 0) {
            this.getGroupInfo('listMember');
        } else {
            this.listMember();
        }
    },

    listMember: function () {
        if (!this.state.memberShowStatus) {
            var me = this;
            if (WebIM.config.isWindowSDK) {
                WebIM.doQuery('{"type":"groupMembers","id":"' + me.props.roomId + '"}',
                    function success(str) {
                        if (str == '') {
                            return;
                        }
                        var members = eval('(' + str + ')');
                        if (members && members.length > 0) {
                            me.refreshMemberList(members);
                        } else {
                            //trigger adding owner to members
                            me.refreshMemberList([]);
                        }
                    },
                    function failure(errCode, errMessage) {
                        Demo.api.NotifyError("listMember:" + errCode + ' ' + errMessage);
                    });
            } else {
                apis.getCrowdList({"hxid": Demo.selected}, this.fetchBack.bind(null,1,this))
            }
        } else {
            this.setState({members: [], memberShowStatus: false});
        }
    },
    fetchBack: function (tag,a,res) {
        if (tag ===1) {
            var data = res.result[0]
            this.setState({groupName: data.name,groupNum: data.memberNum, groupNotic: data.notice})
            apis.getCrowdMemberList({id: data.id}, this.fetchBack.bind(null,2,this));
        } else if (tag===2){
            var data = res.result.members, admin;
             res.result.creator.roleTypeName = "发起人"
            data.unshift(res.result.creator)
            this.refreshMemberList(data);
        }
        
    },
    addToGroupBlackList: function (username) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            var members = this.state.members;
            var options = {
                groupId: Demo.selected,
                username: username,
                success: function () {
                    for (var i in members) {
                        if (members[i]['member'] && members[i]['member'] === username) {
                            delete members[i];
                            break;
                        }
                    }
                    this.setState({members: members});
                }.bind(this),
                error: function () {
                }
            };
            Demo.conn.groupBlockSingle(options);
        }
        /*
         username = [];
         username['1qaz'] = true;
         username['lxj111'] = true;
         var usernames = ['1qaz', 'lxj111'];
         var options = {
         groupId: Demo.selected,
         usernames: usernames,
         success: function () {
         for (var i in members){
         if(members[i]['member'] && username[members[i]['member']]){
         delete members[i];
         }
         }
         this.setState({members: members});
         }.bind(this),
         error: function(){}
         };
         Demo.conn.groupBlockMulti(options);
         */
    },

    // TODO: 群禁言、群升降级
    mute: function (username) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            var muteDuration = 886400000;
            var options = {
                username: username,
                muteDuration: muteDuration,
                groupId: Demo.selected,
                success: function (resp) {
                    var members = this.state.members;
                    for (var i in members) {
                        if (members[i]['member']) {
                            if (members[i]['member'] === username) {
                                members[i]['muted'] = true;
                                break;
                            }
                        }
                    }
                    this.setState({members: members});
                }.bind(this),
                error: function (e) {
                }
            };
            Demo.conn.mute(options);
        }
    },

    // 移除禁言
    removeMute: function (username) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            var options = {
                groupId: Demo.selected,
                username: username,
                success: function (resp) {
                    var members = this.state.members;
                    for (var i in members) {
                        if (members[i]['member']) {
                            if (members[i]['member'] === username) {
                                members[i]['muted'] && delete members[i]['muted'];
                                break;
                            }
                        }
                    }
                    this.setState({members: members});
                }.bind(this),
                error: function (e) {

                }
            };
            Demo.conn.removeMute(options);
        }
    },

    getAdmin: function (data) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            var options = {
                groupId: Demo.selected,
                success: function (resp) {
                    var admin = resp.data;
                    for (var j in admin) {
                        admin[admin[j]] = true;
                        delete admin[j];
                    }
                    for (var i in data) {
                        if (data[i]['member']) {
                            var username = data[i]['member'];
                            if (admin[username]) {
                                data[i]['admin'] = true;
                            }
                        }
                    }
                    this.getMuted(data);
                }.bind(this),
                error: function (e) {
                }
            };
            Demo.conn.getGroupAdmin(options);
        }
    },

    getMuted: function (data) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            var options = {
                groupId: Demo.selected,
                success: function (resp) {
                    var muted = resp.data;
                    for (var i in muted) {
                        var user = muted[i]['user']
                        muted[user] = true;
                        delete muted[i];
                    }
                    for (var j in data) {
                        if (data[j]['member']) {
                            var username = data[j]['member'];
                            if (muted[username]) {
                                data[j]['muted'] = true;
                            }
                        }
                    }
                    this.refreshMemberList(data);
                }.bind(this),
                error: function (e) {
                }
            };
            Demo.conn.getMuted(options);
        }
    },

    setAdmin: function (username) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            // 设置管理员
            var options = {
                groupId: Demo.selected,
                username: username,
                success: function (resp) {
                    var members = this.state.members;
                    for (var i in members) {
                        if (members[i]['member']) {
                            if (members[i]['member'] === username) {
                                members[i]['admin'] = true;
                                break;
                            }
                        }
                    }
                    this.setState({members: members});
                }.bind(this),
                error: function (e) {
                }.bind(this)
            };
            Demo.conn.setAdmin(options);
        }
    },

    removeAdmin: function (username) {
        if (WebIM.config.isWindowSDK) {
            //TODO:isWindowSDK
        } else {
            var me = this;
            // 取消管理员
            var options = {
                groupId: Demo.selected,
                username: username,
                success: function (resp) {
                    var members = me.state.members;
                    for (var i in members) {
                        if (members[i]['member']) {
                            if (members[i]['member'] === username) {
                                if (members[i]['admin']) {
                                    delete members[i]['admin'];
                                }
                                break;
                            }
                        }
                    }
                    me.setState({members: members});
                },
                error: function (e) {
                }
            };
            Demo.conn.removeAdmin(options);
        }
    },

    refreshMemberList: function (members) {
        this.setState({members: members, memberShowStatus: true});
    },

    send: function (msg) {
        msg.chatType = this.props.chatType;
        Demo.conn.send(msg);
        Demo.api.addToChatRecord(msg, 'txt', 'Undelivered');
        Demo.api.appendMsg(msg, 'txt');
    },

    // hide when blur | bind focus event
    componentDidUpdate: function () {
        // this.state.memberShowStatus && ReactDOM.findDOMNode(this.refs['member']).focus();
    },

    componentDidMount: function () {
        Demo.api.releaseChatRecord();
        this.preListMember()
    },

    // hide when blur close
    handleOnBlur: function () {
        this.setState({memberShowStatus: false});
    },
    openStrangeChat: function (username,user) {
        var username1 = username.toLowerCase();
        var msg={ data:"",
                  error:false,
                  errorCode:"",
                  errorText:"",
                  ext:{header:user.header,nick:user.nick},
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

        for (var i in this.state.members) {
            var affiliation = i, user = this.state.members[i], isAdmin = false, isMuted = false;
            var item = this.state.members[i];
             affiliation = 'member';
            if (i===0) {
                affiliation = 'owner';
                isAdmin = true;
                isMuted = true;
            }
            
            var roleTypeName = user.roleType!== 0 ? user.roleTypeName : '';
            var username = item.id;

            if (isAdmin) {
                roomMember.push(<li key={i}>
                    <Avatar src={user.header}/>
                    <span className="webim-group-name">
                        {user.nick}
                        <i className='role-type-name'>{roleTypeName}</i>
                    </span>
                    <div className="webim-operation-icon"
                         style={{display: affiliation == 'owner' ? 'none' : ''}}>
                        <i className={"webim-leftbar-icon font smaller " + className}
                           style={{display: this.state.admin != 1 ? 'none' : ''}}
                           onClick={this.addToGroupBlackList.bind(this, username, i)}
                           title={Demo.lan.addToGroupBlackList}>n</i>
                    </div>
                    <div className="webim-operation-icon"
                         style={{display: affiliation == 'owner' ? 'none' : ''}}>
                        <i className={"webim-leftbar-icon font smaller " + className}
                           style={{display: this.state.admin != 1 ? 'none' : ''}}
                           onClick={isMuted ? this.removeMute.bind(this, username) : this.mute.bind(this, username)}
                           title={isMuted ? Demo.lan.removeMute : Demo.lan.mute}>{isMuted ? 'e' : 'f'}</i>
                    </div>
                    <div className="webim-operation-icon"
                         style={{display: affiliation == 'owner' ? 'none' : ''}}>
                        <i className={"webim-leftbar-icon font smaller " + className}
                           style={{display: this.state.admin != 1 ? 'none' : ''}}
                           onClick={isAdmin ? this.removeAdmin.bind(this, username) : this.setAdmin.bind(this, username)}
                           title={Demo.lan.rmAdministrator}>&darr;</i>
                    </div>
                </li>);
            } else {
                roomMember.push(<li key={i} onClick={Demo.user !== username? this.openStrangeChat.bind(this, username,user): ''}>
                    <Avatar src={user.header||''}/>
                    <span className="webim-group-name">
                    {user.nick}
                    <i className={user.roleTypeName ? 'role-type-name':''} style={{background: user.roleTypeName === '发起人' ? '#f7a105' : (user.roleTypeName === '项目客服' ? '#4eb1f4':'')}}>{roleTypeName}</i>
                    </span>
                    <div className="webim-operation-icon"
                         style={{display: affiliation == 'owner' ? 'none' : ''}}>
                        <i className={"webim-leftbar-icon font smaller " + className}
                           style={{display: this.state.admin != 1 ? 'none' : ''}}
                           onClick={this.addToGroupBlackList.bind(this, username, i)}
                           title={Demo.lan.addToGroupBlackList}>n</i>
                    </div>
                    <div className="webim-operation-icon"
                         style={{display: affiliation == 'owner' ? 'none' : ''}}>
                        <i className={"webim-leftbar-icon font smaller " + className}
                           style={{display: this.state.admin != 1 ? 'none' : ''}}
                           onClick={isMuted ? this.removeMute.bind(this, username) : this.mute.bind(this, username)}
                           title={isMuted ? Demo.lan.removeMute : Demo.lan.mute}>{isMuted ? 'e' : 'f'}</i>
                    </div>
                    <div className="webim-operation-icon"
                         style={{display: affiliation == 'owner' ? 'none' : ''}}>
                        <i className={"webim-leftbar-icon font smaller " + className}
                           style={{display: this.state.admin != 1 ? 'none' : ''}}
                           onClick={isAdmin ? this.removeAdmin.bind(this, username) : this.setAdmin.bind(this, username)}
                           title={Demo.lan.administrator}>&uarr;</i>
                    </div>
                </li>);
            }


        }

        var operations = [];
        if (Demo.selectedCate == 'friends') {
            operations.push(< OperationsFriends
                key='operation_div'
                ref='operation_div'
                roomId={this.props.roomId}
                admin={this.state.admin}
                owner={this.state.owner}
                settings={this.state.settings}
                getGroupInfo={this.getGroupInfo}
                onBlur={this.handleOnBlur}
                name={this.props.name}
                updateNode={this.props.updateNode}
                delFriend={this.props.delFriend}
            />);
        } else if (Demo.selectedCate == 'groups') {
            operations.push(< OperationsGroups
                key='operation_div'
                ref='operation_div'
                name={this.props.name}
                roomId={this.props.roomId}
                admin={this.state.admin}
                owner={this.state.owner}
                settings={this.state.settings}
                fields={this.state.fields}
                getGroupInfo={this.getGroupInfo}
                onBlur={this.handleOnBlur}
                leaveGroup={this.props.leaveGroup}
                destroyGroup={this.props.destroyGroup}
            />);
        }

        return (
            <div className={'webim-chatwindow ' + this.props.className}>
                <div className='webim-chatwindow-title'>
                    {(Demo.selectedCate == 'chatrooms' || Demo.selectedCate == 'groups') ? this.state.groupName : this.props.nick}
                   
                </div>
                <div className={(operations.length > 0) ? '' : 'hide'}>
                    {operations}
                </div>
                <div className={Demo.selectedCate == 'groups' ? 'webim-grounp-right' : 'hide'}>
                    <div className="webim-grounp-notice">
                        <p>成员（{this.state.groupNum}）</p>
                    </div>
                    <ul tabIndex="-1"
                        ref='member'
                        className={'webim-group-memeber' + memberStatus}> {roomMember}
                    </ul>
                </div>
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
