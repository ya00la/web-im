var React = require("react");
var reqwest = require("reqwest");
var Notify = require('../common/notify');
var UI = require('../common/webim-demo');
var apis = require('../../libs/api');

var Input = UI.Input;
var Button = UI.Button;
var Checkbox = UI.Checkbox;

module.exports = React.createClass({
    getInitialState: function () {
        return {
            pageLimit: 8,
            imId: null,
            header: 'http://images.kaistart.com/header2.png'
        };
    },

    validTabs: function () {
        if (!WebIM.config.isMultiLoginSessions || !window.localStorage) {
            return true;
        } else {
            Demo.userTimestamp = new Date().getTime();

            var key = 'easemob_' + Demo.user;
            var val = window.localStorage.getItem(key);
            var count = 0;
            var oneMinute = 60 * 1000;

            if (val === undefined || val === '' || val === null) {
                val = 'last';
            }
            val = Demo.userTimestamp + ',' + val;
            var timestampArr = val.split(',');
            var uniqueTimestampArr = [];
            // Unique

            for (var o in timestampArr) {
                if (timestampArr[o] === 'last')
                    continue;
                uniqueTimestampArr[timestampArr[o]] = 1;
            }

            val = 'last';
            for (var o in uniqueTimestampArr) {
                // if more than one minute, cut it
                if (parseInt(o) + oneMinute < Demo.userTimestamp) {
                    continue;
                }
                count++;
                if (count > this.state.pageLimit) {
                    return false;
                }
                val = o + ',' + val;
            }
            window.localStorage.setItem(key, val);
            return true;
        }
    },

    keyDown: function (e) {
        if (e && e.keyCode === 13) {
            this.login();
        }
    },
    login: function () {
        var username = this.refs.name.refs.input.value;
        var auth = this.refs.auth.refs.input.value;
        if (!username || !auth) {
            Demo.api.NotifyError('用户名或密码' + Demo.lan.notEmpty);
            return false;
        }
        this.signin(username, auth);
    },
     signin: function (username, pwd) {
        apis.userLogin({"username": username, "password": pwd}, this.fetchBack.bind(null,this))
     },
    fetchBack: function (tag,res) {
        var data = res.result
        this.state.imId = data.id
        this.state.header = data.header || this.state.header
        this.loginIM(data.nick, this.state.header)
     },
    loginIM: function (nickname, header) {
        var username = this.state.imId;
        var auth = 'ab3bf44269ddd3ec38ef1b17daea19b1';
        this.signinIM(username, auth, nickname, header, false);
    },

    signinIM: function (username, auth, nickname, header, type) {
        var username = username;
        var auth = auth;
        var type = type;

        if (!username || !auth) {
            Demo.api.NotifyError(Demo.lan.notEmpty);
            return false;
        }
        var me = this
        var options = {
            apiUrl: this.props.config.apiURL,
            user: username.toString(),
            pwd: auth,
            accessToken: auth,
            appKey: this.props.config.appkey,
            success: function (token) {
                var encryptUsername = btoa(username);
                encryptUsername = encryptUsername.replace(/=*$/g, "");
                var token = token.access_token;
                var url = '#username=' + encryptUsername;
                WebIM.utils.setCookie('webim_' + encryptUsername, token, 1);
                WebIM.utils.setCookie('webim_nick', nickname, 1);
                WebIM.utils.setCookie('webim_header', header, 1);
                window.location.href = url
                Demo.token = token;
                // me.props.update({
                //         signIn: false,
                //         signUp: false,
                //         loadingStatus: false,
                //         chat: true
                //     });
            },
            error: function () {
                window.location.href = '#'

            }
        };

        if (!type) {
            delete options.accessToken;
        }
        if (Demo.user) {
            if (Demo.user != username) {
                Demo.chatRecord = {};
            }
        }

        Demo.user = username;
        Demo.nickname = nickname
        Demo.header = header
        this.props.loading('show');

        Demo.conn.autoReconnectNumTotal = 0;

        if (WebIM.config.isWindowSDK) {
            var me = this;
            if (!WebIM.config.appDir) {
                WebIM.config.appDir = "";
            }
            if (!WebIM.config.imIP) {
                WebIM.config.imIP = "";
            }
            if (!WebIM.config.imPort) {
                WebIM.config.imPort = "";
            }
            if (!WebIM.config.restIPandPort) {
                WebIM.config.restIPandPort = "";
            }
            WebIM.doQuery('{"type":"login","id":"' + options.user + '","password":"' + options.pwd
                + '","appDir":"' + WebIM.config.appDir + '","appKey":"' + WebIM.config.appkey + '","imIP":"' + WebIM.config.imIP + '","imPort":"' + WebIM.config.imPort + '","restIPandPort":"' + WebIM.config.restIPandPort + '"}', function (response) {
                    Demo.conn.onOpened();
                },
                function (code, msg) {
                    me.props.loading('hide');
                    Demo.api.NotifyError('open:' + code + " - " + msg);
                });
        } else {
            console.log('login success');
            var me = this
            if (this.validTabs() === true) {
                console.log('begin to open');
                Demo.conn.open(options);
            }
            else {
                Demo.conn.onError({
                    type: "One account can't open more than " + this.state.pageLimit + ' pages in one minute on the same browser'
                });
                return;
            }
        }
    },
    signupIM: function (username, pwd, nickname) {
        var me = this;

        if (this.submiting) {
            return false;
        }

        var username = username
        var pwd = pwd

        if (!username || !pwd) {
            Demo.api.NotifyError(Demo.lan.notEmpty);
            return false;
        }


        this.submiting = true;

        var options = {
            username: username,
            password: pwd,
            nickname: nickname,
            avatarURLPath: this.state.header,
            appKey: this.props.config.appkey,
            apiUrl: this.props.config.apiURL,
            success: function () {
                me.submiting = false;
                Demo.api.NotifySuccess(Demo.lan.signUpSuccessfully);
                setTimeout(function () {
                    me.props.update({
                        signIn: false,
                        signUp: false,
                        chat: true
                    });
                }, 1000);
            },
            error: function (e) {
                me.submiting = false;
                Demo.api.NotifyError(e.data || "registerUser error! Please check the network and try again!");
            }
        };
        if (WebIM.config.isWindowSDK) {
            var appDir = "";
            if(WebIM.config.appDir){
                appDir = WebIM.config.appDir;
            }
            var imIP = "";
            if(WebIM.config.imIP){
                imIP = WebIM.config.imIP;
            }
            var imPort = "";
            if(WebIM.config.imPort){
                imPort = WebIM.config.imPort;
            }
            var restIPandPort = "";
            if(WebIM.config.restIPandPort){
                restIPandPort = WebIM.config.restIPandPort;
            }
            WebIM.doQuery('{"type":"createAccount","id":"' + options.username + '","password":"' + options.password 
                + '","appDir":"' + appDir + '","appKey":"' + WebIM.config.appkey + '","imIP":"' + imIP + '","imPort":"' + imPort + '","restIPandPort":"' + restIPandPort + '"}', function (response) {
                options.success();
            },
            function (code, msg) {
                me.submiting = false;
                alert("registerUser:" + code + " - " + msg);
            });
        } else {
            Demo.conn.registerUser(options);
        }
    },


    componentWillMount: function () {
        var uri = WebIM.utils.parseHrefHash();
        var username = uri.username;
        var nickname = uri.nickname;
        var auth = WebIM.utils.getCookie()['webim_' + username];
        var nickname = WebIM.utils.getCookie()['webim_nick'];
        var header = WebIM.utils.getCookie()['webim_header'];
        Demo.token = auth;
        if (username && auth) {
            username = atob(username);
            this.signinIM(username, auth, nickname, header, true);
        }
    },

    componentDidMount: function () {
        if (WebIM.config.autoSignIn) {
            this.refs.button.refs.button.click();
        }
    },

    render: function () {

        return (
            <div className={this.props.show ? 'webim-sign' : 'webim-sign hide'}>
                <h2>{Demo.lan.signIn}</h2>
                <Input placeholder={Demo.lan.username} defaultFocus='true' ref='name' keydown={this.keyDown}/>
                <Input placeholder={Demo.lan.password} ref='auth' type='password' keydown={this.keyDown}/>
                <Button ref='button' text={Demo.lan.signIn} onClick={this.login}/>
                <p>
                </p>
            </div>
        );
    }
});
