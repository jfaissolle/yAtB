/** @jsx React.DOM */
var Components = (function(comps) {
  "use strict";
    
  var ReactTransitionGroup = React.addons.TransitionGroup;

  var Editable = comps.Editable = React.createClass({
    getInitialState: function() {
      return {editing: false, value: this.props.value};
    },
    handleEdit: function() {
      this.setState({editing: true});
    },
    handleChange: function(e) {
      this.setState({value: e.target.value});
    },
    handleSave: function() {
      this.props.onSave(this.state.value);
      this.setState({editing: false});
    },
    handleCancel: function() {
      this.setState({value: this.props.value, editing: false});
    },
    render: function() {
      if (!this.state.editing) {
        return <div onClick={this.handleEdit} className="editable">{this.state.value}</div>;
      } else {
        return (
          <div>
            <textarea onChange={this.handleChange} value={this.state.value}></textarea>
            <button onClick={this.handleSave}>Save</button>
            <button onClick={this.handleCancel}>Cancel</button>
          </div>
        );
      }
    }
  });
  
  comps.CardDetail = React.createClass({
    componentDidUpdate: function() {
      var self = this;
      if (this.props.task) {
        $('#overlay')
          .addClass('md-show')
          .bind('click', function() {
            self.props.onClose();
            $('#overlay').unbind('click');
          });
        
      } else {
        $('#overlay').removeClass('md-show');
      }
    },
    onFieldChange: function(fieldName, newValue) {
      var task = this.props.task;
      task[fieldName] = newValue;
      this.props.onTaskUpdate(task);
    },
    render: function() {
      var self = this;
      var task = this.props.task;
      var content = task ? (
        <ReactTransitionGroup transitionName="modal" component={React.DOM.div}>
          <div className="md-content">
            <header>
              <h3>
                <Editable value={task.title} onSave={this.onFieldChange.bind(this, 'title')} />
              </h3>
              <a onClick={self.props.onClose} className="close">X</a>
            </header>
            <div>
              
            </div>
          </div>
        </ReactTransitionGroup>) : ""
      
      if (this.props.task) {
        $('#overlay').addClass('md-show');
      }
      
      return (
        <div className="md-modal">
          {content}
        </div>
      );
    }
  });
  
  return comps;
  
})(Components || {});

