import React from 'react';

export const TodoForm = (props) => (
 <form onSubmit={props.handleSubmit}>
 	<input type="text" 
 		onChange={props.update} 
 		value = {props.currentTodo} />
 </form>)
  TodoForm.propTypes = {
    currentTodo: React.PropTypes.string.isRequired,
    update: React.PropTypes.func.isRequired,
    handleSubmit :React.PropTypes.func.isRequired
  }
