import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Button >Button click me</Button>
      <h1 className='text-5xl'>asdfalsdkjf</h1>
    </>
  )
}

export default App
