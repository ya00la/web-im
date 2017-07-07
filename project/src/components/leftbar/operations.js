var React = require("react");
var AddFriend = require("./addFriend");
var CreateGroup = require("../group/createGroup");
var JoinPublicGroup = require("../group/joinPublicGroup");
var ShowBlacklist = require("../blacklist/showBlacklist");

module.exports = React.createClass({

    getInitialState: function () {
        var me = this;
        // TODO 关闭各种弹出框
        return {hide: 'hide'};
    },

    update: function () {
        this.setState({
            hide: this.state.hide ? '' : ' hide'
        });
    },

    addFriends: function () {
        AddFriend.show();
        this.update();
    },

    createGroup: function () {
        CreateGroup.show();
        this.update();
    },

    joinPublicGroup: function () {
        JoinPublicGroup.show();
        this.update();
    },

    showBlacklist: function () {
        ShowBlacklist.show();
        this.update();
    },

    logout: function () {
        var r = confirm('确定退出账号吗？退出后对话记录将不再保存');
        if (r) {
            Demo.selected = '';
            Demo.api.logout(WebIM.statusCode.WEBIM_CONNCTION_CLIENT_LOGOUT);
        } else {
            this.setState({
            hide: this.state.hide ? '' : ' hide'
        });
        }
    },

    restUpdateGroups: function(rooms){
        this.props.restUpdateGroups(rooms);
    },

    render: function () {
        var className = this.state.hide ? ' ' + this.state.hide : '';
        return (
            <div>
                <i className='webim-operations-icon font xsmaller' onClick={this.update}>M</i>
                <ul className={'webim-operations' + className}>
                    <li onClick={this.logout}>
                        <i className='font smallest'>Q</i>
                        <span>{Demo.lan.quit}({this.props.username})</span>
                    </li>
                </ul>
            </div>
        );
    }
});