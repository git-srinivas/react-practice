import React from 'react';

class App extends React.Component {

  constructor(){
    super();
    this.state = {
      txt:'first react',
      cat:0
    }
  }
    update(e){
this.setState({txt:e.target.value})
    }
  
  render() {
    return (
      <div>
        <input type="text" onChange={this.update.bind(this)}/>
      <h1>{this.state.txt} - {this.state.cat}</h1>
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
