import React from 'react';

interface LoginProps {
  title?: string;
  onSuccess?: () => void;
}

interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
}

const API_BASE = 'http://localhost:5143';

export default class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = { email: '', password: '', loading: false, error: null };
  }

  handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: e.target.value });
  };

  handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: e.target.value });
  };

  handleSubmit = () => {
    const { email, password } = this.state;
    this.setState({ loading: true, error: null });

    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(res =>
        res
          .json()
          .then(body => ({ ok: res.ok, status: res.status, body }))
          .catch(() => ({ ok: res.ok, status: res.status, body: null })),
      )
      .then(({ ok, status, body }) => {
        if (!ok) {
          this.setState({
            error: body?.message || `Login failed (${status})`,
            loading: false,
          });
          return;
        }
        this.setState({ loading: false });
        this.props.onSuccess?.();
      })
      .catch(err => {
        this.setState({
          error: err.message ? `Server error: ${err.message}` : 'Server error',
          loading: false,
        });
      });
  };

  render() {
    const { title = 'Login' } = this.props;
    const { email, password, loading, error } = this.state;

    return (
      <div
        className="
          bg-white border-2 border-orange-500 rounded-[48px] md:rounded-[60px]
          p-8 md:p-10 shadow-sm w-[680px] max-w-[92vw]
        "
      >
        <h2 className="text-teal-700 text-2xl font-semibold text-center mb-8">
          {title}
        </h2>

        <div className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-6 items-center">
          <label className="text-teal-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={this.handleEmailChange}
            placeholder="Email"
            className="
              border-2 border-orange-500 rounded-sm px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-orange-300
              text-black placeholder:text-gray-500
            "
          />

          <label className="text-teal-700">Password:</label>
          <input
            type="password"
            value={password}
            onChange={this.handlePasswordChange}
            placeholder="Password"
            className="
              border-2 border-orange-500 rounded-sm px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-orange-300
              text-black placeholder:text-gray-500
            "
          />

          <div className="col-span-2 flex justify-end mt-2">
            <button
              type="button"
              onClick={this.handleSubmit}
              disabled={loading}
              className="
                bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white
                px-5 py-2 rounded-md border-2 border-emerald-900 shadow
                cursor-pointer
              "
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          {error && (
            <div className="col-span-2 text-sm text-red-600 -mt-2">{error}</div>
          )}

          <div className="col-span-2 flex items-center gap-3 mt-4">
            <span className="text-teal-700">No account?</span>
            <button
              type="button"
              className="
                bg-emerald-700 hover:bg-emerald-800 text-white
                px-4 py-1.5 rounded-md border-2 border-emerald-900 shadow
                cursor-pointer
              "
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }
}