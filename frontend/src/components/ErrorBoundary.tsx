import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// React error boundaries must be class components — there is no hook equivalent.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h1 style={styles.heading}>Something went wrong.</h1>
          <p style={styles.body}>
            Try refreshing the page. If the problem persists, contact support.
          </p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAEEDA",
    fontFamily: "sans-serif",
    padding: "32px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "8px",
  },
  body: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  btn: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: 700,
    backgroundColor: "#BA7517",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
