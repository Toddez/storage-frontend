import React from "react";

import Auth from "../models/auth";
import { apiUrl } from "../models/config";

import Form from "../components/Form";

import "../style/Login.css";

interface Props {
  onLogin: () => void;
  onLogout: () => void;
}

type State = {
  data: Record<string, unknown | string | number | boolean>;
  step: number;
  config: string | null;
};

class Login extends Form<Props> {
  onSubmit(data: Record<string, string>): void {
    if (this.state.step === 0) {
      fetch(`${apiUrl}/authorize`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: data.id,
          key: data.key,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.errors) return;

          Auth.setToken(res.data.token);
          this.setState({ step: 1 });

          fetch(`${apiUrl}/2faqrc`, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              "x-access-token": Auth.getToken(),
            },
          })
            .then((res) => res.blob())
            .then((res) => {
              const urlCreator = window.URL || window.webkitURL;
              return urlCreator.createObjectURL(res);
            })
            .then((res) => {
              this.setState({ config: res });
            });
        });
    } else {
      fetch(`${apiUrl}/2fa`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-access-token": Auth.getToken(),
        },
        credentials: "include",
        body: JSON.stringify({
          authKey: data.authKey,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          // TODO: display errors
          if (res.errors) return;

          Auth.setToken(res.data.token);
          this.setState({ step: 0 });
          this.props.onLogin();
        });
    }
  }

  state: State = {
    data: {},
    step: 0,
    config: null,
  };

  _isMounted = false;

  componentDidMount(): void {
    this._isMounted = true;

    fetch(`${apiUrl}/checkup`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.errors) return;

        if (res.data.token) {
          Auth.setToken(res.data.token);

          if (res.data.auth) this.props.onLogin();
          else {
            this.setState({ step: 1 });

            fetch(`${apiUrl}/2faqrc`, {
              method: "POST",
              headers: {
                "Content-type": "application/json",
                "x-access-token": Auth.getToken(),
              },
            })
              .then((res) => res.blob())
              .then((res) => {
                const urlCreator = window.URL || window.webkitURL;
                return urlCreator.createObjectURL(res);
              })
              .then((res) => {
                this.setState({ config: res });
              });
          }
        }
      });
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  onInput(event: React.FormEvent<HTMLInputElement>): void {
    if (!event.currentTarget) return;

    if (event.currentTarget.value.length === 1) {
      if (!event.currentTarget.nextElementSibling) return;

      (event.currentTarget.nextElementSibling as HTMLElement).focus();
    }
  }

  onKeydown(event: React.FormEvent<HTMLInputElement>): void {
    if (!event.currentTarget) return;

    if (
      event.currentTarget.value.length === 0 &&
      ["Backspace", "Delete"].includes((event.nativeEvent as KeyboardEvent).key)
    ) {
      if (!event.currentTarget.previousElementSibling) return;

      (event.currentTarget.previousElementSibling as HTMLElement).focus();
    }
  }

  render(): JSX.Element {
    const authPattern = "[0-9]{6}";

    return (
      <div className="Login">
        {this.state.step === 0 ? (
          <form onSubmit={this.handleSubmit}>
            <div className="input-section">
              <input
                key={0}
                type="password"
                name="id"
                id="id"
                onChange={this.handleChange}
                required
                autoFocus
              />
              <label htmlFor="id">
                <span className="label-text">ID</span>
              </label>
            </div>

            <div className="input-section">
              <input
                key={1}
                type="password"
                name="key"
                id="key"
                onChange={this.handleChange}
                required
              />
              <label htmlFor="key">
                <span className="label-text">Key</span>
              </label>
            </div>

            <input type="submit" value="Authorize" hidden />
          </form>
        ) : (
          <form onSubmit={this.handleSubmit}>
            {this.state.config ? (
              <div className="qr-code-container">
                <div className="qr-code">
                  <img src={this.state.config} alt="qr code" />
                </div>
                <div>
                  Complete account registration by adding 2FA and inputting
                  generated code
                </div>
              </div>
            ) : null}

            <div className="input-section">
              <input
                className="authKey always-show"
                type="text"
                name="authKey"
                id="authKey"
                onInput={this.onInput}
                onChange={this.handleChange}
                inputMode="numeric"
                minLength={6}
                maxLength={6}
                required
                autoFocus
                pattern={authPattern}
              />
              <label htmlFor="authKey">
                <span className="label-text">2FA Key</span>
              </label>
              <a
                className="logout"
                onClick={() => {
                  this.props.onLogout();
                  this.setState({ step: 0, config: null });
                }}
              >
                Cancel
              </a>
            </div>

            <input type="submit" value="Authorize" hidden />
          </form>
        )}
      </div>
    );
  }
}

export default Login;
