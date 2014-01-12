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
    componentWillUpdate: function() {
      if (this.refs && this.refs.fieldtext) {
        this.refs.fieldtext.getDOMNode().innerHTML = '';
      }
    },
    componentDidMount: function() {
      if (this.state.editing) {
        this.refs.textinput.getDOMNode().focus();
      } else {
        var rawMarkup = converter.makeHtml(this.state.value);
        console.log(rawMarkup);
        this.refs.fieldtext.getDOMNode().innerHTML = rawMarkup;
      }
    },
    componentDidUpdate: function() {
      if (!this.state.editing) {
        var rawMarkup = converter.makeHtml(this.state.value);
        console.log(rawMarkup);
        this.refs.fieldtext.getDOMNode().innerHTML = rawMarkup;
      }
    },
    render: function() {
      if (!this.state.editing) {
        var rawMarkup = converter.makeHtml(this.state.value);
        return React.DOM.div( {ref:"fieldtext", onClick:this.handleEdit, className:"field editable"} );
      } else {
        return (
          React.DOM.div(null, 
            React.DOM.textarea( {rows:"4", ref:"textinput", onChange:this.handleChange,
                      placeholder:"Enter Text (Markdown)", value:this.state.value}),
            React.DOM.button( {onClick:this.handleSave}, "Save"),
            React.DOM.button( {onClick:this.handleCancel}, "Cancel")
          )
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
        ReactTransitionGroup( {transitionName:"modal", component:React.DOM.div}, 
          React.DOM.div( {className:"md-content"}, 
            React.DOM.header(null, 
              React.DOM.h3(null, 
                Editable( {value:task.title, onSave:this.onFieldChange.bind(this, 'title')} )
              ),
              React.DOM.a( {onClick:self.props.onClose, className:"close"}, "X")
            ),
            React.DOM.div(null, 
              React.DOM.h4(null, "Details ", React.DOM.i( {className:"fa fa-align-justify"})),
              React.DOM.div( {className:"taskdetails"}, 
                Editable( {value:task.details || '', onSave:this.onFieldChange.bind(this, 'details')} )
              ),
              React.DOM.p(null, 
              " Deadline ", React.DOM.i( {className:"fa fa-calendar"}),Datepicker( {date:task.date,
                        onChange:this.onFieldChange.bind(this, 'date')} )
              ),
              React.DOM.p(null, 
              " Tags: ", _.map(task.tags, function(it) { 
                     return React.DOM.i( {key:'bullet'+it, className:'bullet color-'+it}) })
              )
            )
          )
        )) : ""
      
      if (this.props.task) {
        $('#overlay').addClass('md-show');
      }
      
      return (
        React.DOM.div( {className:"md-modal"}, 
          content
        )
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
      var task = this.props.task;
      var rawMarkup = converter.makeHtml(task.title);
      
      return (
        React.DOM.article( {onDragStart:this.handleDragStart,     
                 onDragEnd:this.handleDragEnd,
                 onClick:this.props.onSelect,
                 draggable:"true", className:classes}, 
          React.DOM.div( {className:"field", dangerouslySetInnerHTML:{__html: rawMarkup}} ),
          React.DOM.img( {className:"profile-pic"}),
          React.DOM.div( {className:"task-icons"}, 
            task.details ? React.DOM.i( {className:"fa fa-align-justify"}) : '',
            task.date && React.DOM.i( {className:"fa fa-calendar"}, ' '+moment(task.date).format('L')),
            _.map(task.tags, function(it) { return React.DOM.i( {key:'bullet'+it, className:'bullet color-'+it}) })
          )
        )
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
        return React.DOM.button( {onClick:self.handleNew}, "New");
      } else {
        return (
          React.DOM.div(null, 
            React.DOM.article( {className:"taskcard cardeditor"}, 
              React.DOM.textarea( {placeholder:"Task Title (Markdown)", ref:"textinput", value:self.state.tasktext,
                        onChange:self.handleChange} )
            ),
            React.DOM.button( {onClick:self.handleAdd}, "Add"),
            React.DOM.button( {onClick:self.handleCancel}, "Cancel")
          )
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
        React.DOM.span(null, 
          React.DOM.input( {type:"text", className:"date", ref:"datefield",
                 value:this.state.date && moment(this.state.date).format('L'), placeholder:"None"}), 
           this.state.date && React.DOM.button( {onClick:this.clear}, "Clear")
        ));
    }
  });
  
      
  return comps;
  
})(TaskComponents || {});

