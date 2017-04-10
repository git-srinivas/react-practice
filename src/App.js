import React from 'react';

class App extends React.Component {
  render() {
    return (
      <div>
      <h1>{this.props.txt}</h1>
      <b>Bold</b>
      </div>
    )
  
}
}

App.propTypes  = {
  txt: React.PropTypes.string,
  cat:React.PropTypes.number.isRequired
}
App.defaultProps = {
  txt: "default",
  cat:React.PropTypes.number.isRequired
}

export default App;
