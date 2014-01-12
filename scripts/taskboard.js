/** @jsx React.DOM */
(function() {
  'use strict';
  

  var cx = React.addons.classSet;
  var CardDetail = TaskComponents.CardDetail;
  var CardEditor = TaskComponents.CardEditor;
  var TaskCard = TaskComponents.TaskCard;
  
  var TagList = React.createClass({displayName: 'TagList',
    render: function() {
      var tags = this.props.tags.map(function(tag) {
        var classes = { bullet: true };
        classes['color-'+tag.id] = true;

        return (
          React.DOM.li( {key:tag+tag.id}, 
            React.DOM.span( {key:tag.name, className:cx(classes)}), ' '+tag.name
          )
        );
      });
      
      return (
        React.DOM.ul( {className:"taglist"}, 
          tags
        )
      );
    }
  });
  
  var DropZone = React.createClass({displayName: 'DropZone',
    getInitialState: function() {
      return {over: false};
    },
    handleDragEnter: function(e) {
      e.nativeEvent.dropEffect = 'move';
      e.preventDefault();
      this.setState({over: true});
      return false;
    },
    handleDragLeave: function(e) {
      this.setState({over: false});
    },
    handleDrop: function(e) {
      if (this.props.onDrop) {
        this.props.onDrop({
          origin: e.nativeEvent.dataTransfer.getData('Text')
        }); 
      }
      e.preventDefault();
      this.setState({over: false});
      return false;
    },
    render: function() {
      var classes = cx({
        spacer: true,
        over: this.state.over
      });
      return React.DOM.div( {onDragEnter:this.handleDragEnter, onDragOver:this.handleDragEnter,
                  onDragLeave:this.handleDragLeave,
                  onDrop:this.handleDrop, className:classes} )
    }
  });
  

  
  var TaskLane = React.createClass({displayName: 'TaskLane',
    onDragCard: function(task, e) {
      e.nativeEvent.dataTransfer.setData('Text', this.props.name+','+task.id);
    },
    onDrop: function(index, dropInfo) {
      dropInfo.destIndex = index; 
      this.props.onCardDrop(dropInfo);
    },
    render: function() {
      var self = this;
      var index = 0;
      var cards = this.props.tasks.map(function(task) {
        return (
          React.DOM.div( {key:task.id}, 
            DropZone( {onDrop:self.onDrop.bind(self, index++)} ),
            TaskCard( {task:task, onDrag:self.onDragCard.bind(self, task),
                                  onSelect:self.props.onSelectCard.bind(null, task)} )
          )
        );
      });
      return (
        React.DOM.section( {className:"tasklane"}, 
          React.DOM.header(null, 
            React.DOM.h2(null, this.props.name, " (",this.props.tasks.length,")")
          ),
          React.DOM.div(null, 
            React.DOM.div(null, 
              cards
            ),
            DropZone( {onDrop:self.onDrop.bind(self, index++)} ),
            CardEditor( {onAdd:self.props.onCardAdd} )
          )
        )
      );
    }
  });
  
  var TaskBoard = React.createClass({displayName: 'TaskBoard',
    onCardMove: function(dropLane, dropInfo) {
      var splittedOrig = dropInfo.origin.split(',');
      var taskboard = this.props.taskboard;
      taskboard.moveTask(
        _.parseInt(splittedOrig[1]), splittedOrig[0],
        dropLane, dropInfo.destIndex
      );
      
      this.setProps({taskboard: taskboard});
    },
    onCardAdd: function(lane, card) {
      var taskboard = this.props.taskboard;
      taskboard.addTask(card, lane);
      this.setProps({taskboard: taskboard});
    },
    render: function() {
      var self = this;
      var lanes = this.props.taskboard.tasklanes.map(function(lane) {
        return TaskLane( {key:lane.name, name:lane.name, tasks:lane.tasks,
                         onCardDrop:self.onCardMove.bind(self, lane),
                         onCardAdd:self.onCardAdd.bind(self, lane),
                         onSelectCard:self.props.onSelectCard} );
      });
      
      return (
        React.DOM.section( {className:"taskboard"}, 
          lanes
        )
      );
    }
  });
  

  var taskboard = {
    seq: 13,
    tasklanes: [
      {
        name: 'ToDo',
        tasks: [
          {id: 1, title: 'Prototype UI', tags: [2]},
          {id: 2, title: 'Send Email to teacher assignment 1', tags: [1]},
          {id: 7, title: 'Task with details', details: 'Some task details...'},
          {id: 3, title: 'Send Email to teacher assignment 2', tags: [2]},
          {id: 10, title: 'Assignment 3 (Lab)', tags: [3]},
          {id: 11, title: 'YATB prototype', tags: [4], date: moment("20140113", "YYYYMMDD"),
           details: "yAtB\n"+
                    "====\n"+
                    "\n"+
                    "Yet Another Task Board\n"+
                    "\n"+
                    "Your classical ToDo, Doing, Done stuff.\n"+
                    "\n"+
                    "An exercise for practicing HTML5, React and Sass (Compass).\n"+
                    "\n"+
                    "[Demo](http://jfaissolle.github.io/yAtB/)\n"
          },
          {id: 12, title: 'Send Email to teacher', tags: [4]}
        ]
      },
      {
        name: 'Doing',
        tasks: [
          {id: 4, title: 'Create Slides', tags: [2]},
          {id: 5, title: 'Sketch UI', tags: [2]},
          {id: 8, title: 'Task with date', date: moment().add('days', 10) }
        ]
      },
      {
        name: 'Done',
        tasks: [
          {id: 6, title: 'Respond to the six questions', tags: [2]}
        ]
      }
    ],
    addTask: function(task, lane) {
      task.id = this.seq++;
      lane.tasks.push(task);
    },
    moveTask: function(taskId, origLane, destLane, destIndex) {
      var fromLane = this.getLane(origLane);
      var task = (_.remove(fromLane.tasks, {id: taskId}))[0];
      destLane.tasks.splice(destIndex, 0, task);
    },
    getLane: function(laneName) {
       return _.find(this.tasklanes, {name: laneName});
    }
  }
 
  var tags = [
    {id: 1, name: 'Assignment 1'},
    {id: 2, name: 'Assignment 2'},
    {id: 3, name: 'Assignment 3'},
    {id: 4, name: 'Assignment 4'}
  ];


  var app = function() {
    
    function showDetails(task) {
      detail.setProps({task: task});      
    }

    function hideDetails() {
      detail.setProps({task: null});
    }
    
    function updateTask(task) {
      detail.setProps({task: task});
      taskBoardComp.setProps({taskboard: taskboard});

    }
    
    
    var detail = React.renderComponent(
      CardDetail( {onClose:hideDetails, onTaskUpdate:updateTask} ),
      document.getElementById('modal')
    );
    
    React.renderComponent(
      TagList( {tags:tags} ),
      document.getElementById('taglist')
    );
    
    var taskBoardComp = React.renderComponent(
      TaskBoard( {taskboard:taskboard, onSelectCard:showDetails} ),
      document.getElementById('taskboard')
    );
  };

  $(function() {
  
    app();
    
  });
})();

