import { error } from "console";
import React from "react";
import { User} from "./Login.state";


export interface LoginState{
  username : string,
  password: string
  loginUser: (_:User)  => void
}




export class Login extends React.Component<{}, LoginState> {
    constructor(props: {}){
    super(props)
    this.state ={
      username: "",
      password: "",
      loginUser: (user: User) => {
        console.log("Login attempt:", user);
        // TODO: Implement login logic
      }
    };
  }


 
  render(){
    return (
    
      <div>
        <div>
          Username:
          <input
            type="text" 
            value={this.state.username}
            onChange={e=> this.setState({...this.state, username: e.currentTarget.value})}
          />
        </div>
        <div>
          Password:
          <input
            type="password"
            value={this.state.password}
            onChange={e=> this.setState({...this.state, password:e.currentTarget.value})}
          />
        </div>
        <div>
          <button 
            onClick={_=> this.state.loginUser({
              username: this.state.username,
              password: this.state.password
            })}
          >
              Submit
          </button>
        </div>
      </div>
    )
    }
    

}
export default Login;