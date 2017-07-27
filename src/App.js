import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import {TodoForm, TodoList} from './components/todo'
import {addTodo, generateId, findById, toggleTodo, updateTodo} from './lib/todoHelpers'
import {pipe, partial} from './lib/utils'
class App extends Component {
 state = {
    todos: [
      {id: 1, name: 'Learn JSX', isComplete: true},
      {id: 2, name: 'Build an Awesome App', isComplete: false},
      {id: 3, name: 'Ship It', isComplete: false}
    ],
  currentTodo : ''
  }
  handleToggle = (id) => {
    const getUpdateTodos = pipe(findById, toggleTodo, partial(updateTodo,this.state.todos))
    const updatedTodos = getUpdateTodos(toggleTodo,this.state.todos)
    this.setState({todos: updatedTodos})
  }
  handleSubmit = (eve) => {
    eve.preventDefault()
    const newId = generateId()
    const newTodo = {id: newId,name: this.state.currentTodo, isComplete:false}
    const updateTodos = addTodo(this.state.todos,newTodo)
    this.setState({
      todos : updateTodos,
      currentTodo : '',
      errorMsg : ''
    })
  }
  handleEmply = (evt) => {
    evt.preventDefault();
    this.setState({
      errorMsg:'please fill the todo'
    })
  }
  update = (e) => {
    this.setState({
      currentTodo : e.target.value
    });
  }
  render() {
    const submitHandler = this.state.currentTodo ? this.handleSubmit : this.handleEmply
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>React Todos</h2>
        </div>
        <div className="Todo-App">
          {this.state.errorMsg && <span className='error'>{this.state.errorMsg}</span>}
          <TodoForm currentTodo={this.state.currentTodo} update={this.update} handleSubmit={submitHandler}/>
          <TodoList todos={this.state.todos} handleToggle={this.handleToggle}/>

        </div>
      </div>
    );
  }
}

export default App;
