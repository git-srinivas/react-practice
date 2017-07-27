export const addTodo = (list,item) => [...list,item]

export const generateId = () => Math.floor(Math.random()*100000)

export const findById = (id,list) => list.find(item => item.id === id)

export const toggleTodo = (item) => ({...item, isComplete:!item.isComplete})

export const updateTodo = (update,list) => {
  const itemIndex = list.findIndex(item => item.id === update.id);
  return [
    ...list.slice(0,itemIndex),
    update,
    ...list.slice(itemIndex+1)
  ]
}
