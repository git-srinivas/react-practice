export const addTodo = (list,item) => [...list,item]

export const generateId = () => Math.floor(Math.random()*100000)

export const findById = (id,list) => list.find(item => item.id === id)

export const toggleTodo = (item) => ({...item, isComplete: !item.isComplete})

export const updateTodo = (list,update) => {
  const itemIndex = list.findIndex(item => item.id === update.id);
  return [
    ...list.slice(0,itemIndex),
    update,
    ...list.slice(itemIndex+1)
  ]
}

export const removeTodo = (list, id) => {
  const removeIndex = list.findIndex(item => item.id === id)
  return [
    ...list.slice(0, removeIndex),
    ...list.slice(removeIndex+1)
  ]
}

export const filterTodos = (list, route) => {
  switch(route){
    case '/active':
      return list.filter(item => !item.isComplete)
    case '/complete':
      return list.filter(item => item.isComplete)
    default:
      return list
  }
}
