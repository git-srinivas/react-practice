import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import {TodoForm, TodoList} from './components/todo'
import {addTodo, generateId} from './lib/todoHelpers'

class App extends Component {
  constructor(){
    super();
    this.state = {
      todos: [
        {id: 1, name: 'Learn JSX', isComplete: true},
        {id: 2, name: 'Build an Awesome App', isComplete: false},
        {id: 3, name: 'Ship It', isComplete: false}
      ],
    currentTodo : ''
    }  
    this.update = this.update.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleSubmit(eve){
    eve.preventDefault()
    const newId = generateId()
    const newTodo = {id: newId,name: this.state.currentTodo, isComplete:false}
    const updateTodos = addTodo(this.state.todos,newTodo)
    this.setState({
      todos : updateTodos,
      currentTodo : ''
    })
  }
  update(e){
    this.setState({
      currentTodo : e.target.value
    });
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>React Todos</h2>
        </div>
        <div className="Todo-App">
          <TodoForm currentTodo={this.state.currentTodo} update={this.update} handleSubmit={this.handleSubmit}/> 
          <TodoList todos={this.state.todos}/>

        </div>
      </div>
    );
  }
}

export default App;