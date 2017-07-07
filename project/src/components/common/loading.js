var React = require("react");

module.exports = React.createClass({
    render: function () {
        return (
            <div className={'webim-loading' + (this.props.show === 'show' ? '' : ' hide')}>
                <img src={Demo.FILENAME + '/images/loading.gif'}/>
                <span>{this.props.msg}</span>
            </div>
        );
    }
});
