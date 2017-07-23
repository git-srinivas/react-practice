import React from 'react';

export const TodoForm = (props) => (
 <form>
 	<input type="text" 
 		onChange={props.update} 
 		value = {props.currentTodo} />
 </form>)