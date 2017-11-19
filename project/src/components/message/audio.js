var React = require("react");
var ReactDOM = require('react-dom');
// var Avatar = require('../common/avatar');
var moment = require('moment');

var preMsgTime = null
var AudioMsg = React.createClass({

    getInitialState: function () {
        return {
            status: 0,
            src: null
        };
    },

    componentDidMount: function () {
        var me = this;

        var options = {url: me.props.value};

        options.onFileDownloadComplete = function (response) {
            var objectURL = WebIM.utils.parseDownloadResponse.call(Demo.conn, response);

            me.refs.audio.onended = function () {
                me.setState({status: 0});
            };

            if ((WebIM.utils.getIEVersion === null || WebIM.utils.getIEVersion > 9) && window.Audio) {
                me.setState({src: objectURL});
            }

        };

        options.onFileDownloadError = function () {
            me.stop();
            me.setState({status: 0});
        };

        options.headers = {
            'Accept': 'audio/mp3'
        };
        WebIM.utils.download.call(Demo.conn, options);

    },

    stop: function () {

        var audios = document.getElementsByTagName('audio');
        for (var i = 0, l = audios.length; i < l; i++) {
            if (audios[i] && audios[i].getAttribute('id') !== this.props.id) {
                audios[i].pause();
                audios[i].currentTime = 0;
            }
        }
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.src !== this.state.src || nextState.status !== this.state.status;
    },

    componentDidUpdate: function (prevProps, prevState) {
        var me = this;

        if (me.state.status) {
            me.refs.bg.className = 'webim-audio-slash slash';

            if (me.state.src) {
                if (!me.refs.audio.src) {
                    me.refs.audio.src = me.state.src;
                }
                me.refs.audio.play();
            }
        } else {
            me.refs.bg.className = 'webim-audio-slash';
            me.refs.audio.pause();
            me.refs.audio.currentTime = 0;
        }
    },

    toggle: function () {
        this.stop();
        this.setState({status: this.state.status ? 0 : 1});
    },

    render: function () {
        var icon = this.props.className === 'left' ? 'H' : 'I';
        var showTime = this.props.time
        // if (preMsgTime) {
        //     if (moment(showTime).from(preMsgTime) === 'a few seconds ago'){
        //         preMsgTime = this.props.time
        //         showTime = ''
        //     } else {
        //         preMsgTime = this.props.time
        //     }
        // } else {
        //     preMsgTime = this.props.time
        // }
        return (
            <div className={"webim-msg-box"}>
                <p style={{textAlign:'center', color:'#999'}}>{showTime}</p>
                <div className={'rel pointer ' + this.props.className}>
                    <p className={this.props.className}>{this.props.name}</p>
                    <div className='webim-msg-value'>
                        <span className='webim-msg-icon font'>{icon}</span>
                        <div>
                            <div className='webim-audio-msg'>{'audio ' + this.props.length + '\'\''}</div>
                        </div>
                        <div ref='bg' className='webim-audio-slash' onClick={this.toggle}></div>
                    </div>
                    <audio id={this.props.id} ref='audio' className='hide'/>
                </div>
            </div>
        );
    }
});

module.exports = function (options, sentByMe) {
    var props = {
        // src: options.avatar || Demo.FILENAME + '/images/default.png',
        time: options.time || moment().format('YYYY-MM-DD h:mm'),
        value: options.value || '',
        name: options.name,
        length: options.length || '',
        id: options.id,

        error: options.error,
        errorText: options.errorText
    };
    console.log(props.time)

    var node = document.createElement('div');
    node.className = 'webim-msg-container rel';
    options.wrapper.appendChild(node);

    Demo.api.scrollIntoView(node);

    return ReactDOM.render(
        <AudioMsg {...props} className={sentByMe ? 'right' : 'left'}/>,
        node
    );
};
