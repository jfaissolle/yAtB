/** @jsx React.DOM */
var TaskComponents = (function(comps) {
  "use strict";
    
  var cx = React.addons.classSet;
  var converter = new Showdown.converter();
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
    componentDidUpdate: function() {
      if (this.state.editing) {
        this.refs.textinput.getDOMNode().focus();
      }
    },
    render: function() {
      if (!this.state.editing) {
        var rawMarkup = converter.makeHtml(this.state.value);
        return <div onClick={this.handleEdit} className="field editable" dangerouslySetInnerHTML={{__html: rawMarkup}}/>;
      } else {
        return (
          <div>
            <textarea rows="4" ref="textinput" onChange={this.handleChange}
                      placeholder="Enter Text (Markdown)" value={this.state.value}></textarea>
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
              <h4>Details</h4>
              <div className="taskdetails">
                <Editable value={task.details || ''} onSave={this.onFieldChange.bind(this, 'details')} />
              </div>
              <h4>Deadline</h4>
              <Datepicker date={task.date} onChange={this.onFieldChange.bind(this, 'date')} />
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

  var TaskCard = comps.TaskCard = React.createClass({
    getInitialState: function() {
      return {dragged: false};
    },
    handleDragStart: function(e) {
      this.props.onDrag(e);
      this.setState({dragged: true});
    },
    handleDragEnd: function(e) {
      e.preventDefault();
      this.setState({dragged: false});
      return false;
    },
    render: function() {
      var classes = cx({
        taskcard: true,
        dragged: this.state.dragged
      });
      var rawMarkup = converter.makeHtml(this.props.task.title);
      return (
        <article onDragStart={this.handleDragStart}     
                 onDragEnd={this.handleDragEnd}
                 onClick={this.props.onSelect}
                 draggable="true" className={classes}>
          <div className="field" dangerouslySetInnerHTML={{__html: rawMarkup}} />
          <img className="profile-pic"/>
          <div className="task-icons">
            {this.props.task.details ? <i className="fa fa-align-justify"/> : ''}
            {this.props.task.date && <i className="fa fa-calendar">{' '+moment(this.props.task.date).format('L')}</i>}
          </div>
        </article>
      );
    }
  });
  
  
  var CardEditor = comps.CardEditor = React.createClass({
    getInitialState: function() {
      return {editing: false};
    },
    handleNew: function() {
      this.setState({editing: true, tasktext: ''});
    },
    handleChange: function(e) {
      this.setState({tasktext: e.target.value});
    },
    handleAdd: function() {
      if (this.state.tasktext.length) {
        this.props.onAdd({title: this.state.tasktext});
      }
      this.setState({editing: false});
    },
    handleCancel: function() {
      this.setState({editing: false});
    },
    componentDidUpdate: function() {
      if (this.state.editing) {
        this.refs.textinput.getDOMNode().focus();
      }
    },
    render: function() {
      var self = this;
      if (!this.state.editing) {
        return <button onClick={self.handleNew}>New</button>;
      } else {
        return (
          <div>
            <article className="taskcard cardeditor">
              <textarea placeholder="Task Title (Markdown)" ref="textinput" value={self.state.tasktext}
                        onChange={self.handleChange} />
            </article>
            <button onClick={self.handleAdd}>Add</button>
            <button onClick={self.handleCancel}>Cancel</button>
          </div>
        );
      }
    }
  });


  var Datepicker = comps.Datepicker = React.createClass({
    getInitialState: function() {
      return {date: this.props.date};
    },
    componentDidMount: function(node) {
      var self = this;
      this.state.picker =  new Pikaday({ 
        field: this.refs.datefield.getDOMNode(),
        format: 'L',
        onSelect: self.handleChange
      });
    },
    handleChange: function(date) {
      this.props.onChange(date);
      this.setState({date: date});
    },
    clear: function() {
      this.props.onChange(null);
      this.state.picker.setDate(null);
      this.setState({date: null});
    },
    render: function() {
      return (
        <div>
          <input type="text" className="date editable" ref="datefield"
                 value={this.state.date && moment(this.state.date).format('L')} placeholder="Date"/> 
          <button onClick={this.clear}>Clear</button>
        </div>);
    }
  });
  
      
  return comps;
  
})(TaskComponents || {});

