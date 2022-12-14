import React from 'react'
import { Link } from 'react-router-dom'

const OtherPage = () => {
  return (
    <div>
        <h3>I'm some other page!</h3>
        <Link to="/">Go Back Home</Link>
    </div>
  )
}

export default OtherPage