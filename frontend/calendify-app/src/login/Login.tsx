const Login: React.FC<{}> = () => {
    return (
    
      <div>
        <div>
          Username:
          <input
            type="text"
          />
        </div>
        <div>
          Password:
          <input
            type="password"
          />
        </div>
        <div>
          <button>
              Submit
          </button>
        </div>
      </div>


    )

}
export default Login;