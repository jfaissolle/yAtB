/** @jsx React.DOM */
(function() {
  'use strict';
  $(function() {
    var cx = React.addons.classSet;
    
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
            destIndex: this.props.index,
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
    
    var TaskCard = React.createClass({
      getInitialState: function() {
        return {dragged: false};
      },
      handleDragStart: function(e) {
        this.props.onDrag(e, this.props.task);
        //e.nativeEvent.dataTransfer.setData('Text', this.props.task.id);
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
        return (
          <article onDragStart={this.handleDragStart}     
                   onDragEnd={this.handleDragEnd}
                   draggable="true" className={classes}>
            {this.props.task.title}
            <img className="profile-pic"/>
            <div className="task-icons"></div>
          </article>
        );
      }
    });
    
    var TaskLane = React.createClass({
      onDrag: function(e, task) {
        e.nativeEvent.dataTransfer.setData('Text', this.props.name+','+task.id);
      },
      onDrop: function(dropInfo) {
        dropInfo.destination = this.props.name;
        this.props.onCardDrop(dropInfo);
      },
      render: function() {
        var self = this;
        var index = 0;
        var cards = this.props.tasks.map(function(task) {
          return (
            <div key={task.id}>
              <DropZone index={index++} onDrop={self.onDrop} />
              <TaskCard task={task} onDrag={self.onDrag} />
            </div>
          );
        });
        return (
          <section className="tasklane">
            <h2>{this.props.name}</h2>
            <div>
              {cards}
            </div>
            <DropZone index={index++} onDrop={self.onDrop} />
            <button>Add</button>
          </section>
        );
      }
    });
    
    var TaskBoard = React.createClass({
      onCardDrop: function(dropInfo) {
        console.log(dropInfo);
        var splittedOrig = dropInfo.origin.split(',');
        var taskboard = this.props.taskboard;
        taskboard.moveTask(
          _.parseInt(splittedOrig[1]), splittedOrig[0],
          dropInfo.destination, dropInfo.destIndex
        );
        
        this.setProps({taskboard: taskboard});
      },
      render: function() {
        var self = this;
        var lanes = this.props.taskboard.tasklanes.map(function(lane) {
          return <TaskLane key={lane.name} name={lane.name} tasks={lane.tasks}
                           onCardDrop={self.onCardDrop} />;
        });
        
        return (
          <section className="taskboard">
            {lanes}
          </section>
        );
      }
    });
    
  
    var taskboard = {
      tasklanes: [
        {
          name: 'ToDo',
          tasks: [
            {id: 1, title: 'Prototype UI'},
            {id: 2, title: 'Send Email to teacher assignment 1'},
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
      moveTask: function(taskId, origLane, destLane, destIndex) {
        var fromLane = this.getLane(origLane);
        var toLane = this.getLane(destLane);
        var task = (_.remove(fromLane.tasks, {id: taskId}))[0];
        toLane.tasks.splice(destIndex, 0, task);
      },
      getLane: function(laneName) {
         return _.find(this.tasklanes, {name: laneName});
      }
    }
    
    window.taskboard = taskboard;
    
    var tags = [
      {name: 'Assignment 1', color: 'green'},
      {name: 'Assignment 2', color: 'yellow'},
      {name: 'Assignment 3', color: 'red'}
    ];
    
    React.renderComponent(
      <TagList tags={tags} />,
      document.getElementById('taglist')
    );
    
    React.renderComponent(
      <TaskBoard taskboard={taskboard} />,
      document.getElementById('taskboard')
    );
  });
})();

