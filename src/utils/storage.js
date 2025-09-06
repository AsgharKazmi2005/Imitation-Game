// Utility functions to get and set messages in localStorage
export const getMessages = () => JSON.parse(localStorage.getItem('imitation-messages') || '[]')
export const setMessages = (msgs) => localStorage.setItem('imitation-messages', JSON.stringify(msgs))
