/** @jsx React.DOM */
(function() {
  'use strict';
  

  var cx = React.addons.classSet;
  var CardDetail = TaskComponents.CardDetail;
  var CardEditor = TaskComponents.CardEditor;
  var TaskCard = TaskComponents.TaskCard;
  
  var TagList = React.createClass({
    render: function() {
      var tags = this.props.tags.map(function(tag) {
        var color = {'background-color': tag.color};
        return (
          <li key={tag.name}>
            <span className="bullet" style={color}></span> {' '+tag.name}
          </li>
        );
      });
      
      return (
        <ul className="taglist">
          {tags}
        </ul>
      );
    }
  });
  
  var DropZone = React.createClass({
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
      return <div onDragEnter={this.handleDragEnter} onDragOver={this.handleDragEnter}
                  onDragLeave={this.handleDragLeave}
                  onDrop={this.handleDrop} className={classes} />
    }
  });
  

  
  var TaskLane = React.createClass({
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
          <div key={task.id}>
            <DropZone onDrop={self.onDrop.bind(self, index++)} />
            <TaskCard task={task} onDrag={self.onDragCard.bind(self, task)}
                                  onSelect={self.props.onSelectCard.bind(null, task)} />
          </div>
        );
      });
      return (
        <section className="tasklane">
          <header>
            <h2>{this.props.name} ({this.props.tasks.length})</h2>
          </header>
          <div>
            <div>
              {cards}
            </div>
            <DropZone onDrop={self.onDrop.bind(self, index++)} />
            <CardEditor onAdd={self.props.onCardAdd} />
          </div>
        </section>
      );
    }
  });
  
  var TaskBoard = React.createClass({
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
        return <TaskLane key={lane.name} name={lane.name} tasks={lane.tasks}
                         onCardDrop={self.onCardMove.bind(self, lane)}
                         onCardAdd={self.onCardAdd.bind(self, lane)}
                         onSelectCard={self.props.onSelectCard} />;
      });
      
      return (
        <section className="taskboard">
          {lanes}
        </section>
      );
    }
  });
  

  var taskboard = {
    seq: 7,
    tasklanes: [
      {
        name: 'ToDo',
        tasks: [
          {id: 1, title: 'Prototype UI'},
          {id: 2, title: 'Send Email to teacher assignment 1'},
          {id: 7, title: 'Task with details', details: 'Some task details...'},
          {id: 3, title: 'Send Email to teacher assignment 2'}
        ]
      },
      {
        name: 'Doing',
        tasks: [
          {id: 4, title: 'Create Slides', state: 'Doing'},
          {id: 5, title: 'Sketch UI', state: 'Done'}
        ]
      },
      {
        name: 'Done',
        tasks: [
          {id: 6, title: 'Respond to the six questions', state: 'Done'}
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
    {name: 'Assignment 1', color: 'green'},
    {name: 'Assignment 2', color: 'yellow'},
    {name: 'Assignment 3', color: 'red'}
  ];


  var app = function() {
    
    function showDetails(task) {
      detail.setProps({task: task});      
    }

    function hideDetails() {
      detail.setProps({task: null});
    }
    
    function updateTask(task) {
      taskBoardComp.setProps({taskboard: taskboard});
    }
    
    
    var detail = React.renderComponent(
      <CardDetail onClose={hideDetails} onTaskUpdate={updateTask} />,
      document.getElementById('modal')
    );
    
    React.renderComponent(
      <TagList tags={tags} />,
      document.getElementById('taglist')
    );
    
    var taskBoardComp = React.renderComponent(
      <TaskBoard taskboard={taskboard} onSelectCard={showDetails} />,
      document.getElementById('taskboard')
    );
  };

  $(function() {
  
    app();
    
  });
})();

