import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details to a service (e.g., Sentry, LogRocket)
    console.error("Error Boundary Caught an Error:", error);
    console.error("Error Details:", errorInfo);

    // Optionally, send error details to an external logging service
    // logErrorToService({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Customize the fallback UI
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Something went wrong.</h1>
          <p>We're working to fix it. Please try again later.</p>
          {/* Optionally, show error details in development mode */}
          {process.env.NODE_ENV === "development" && (
            <details style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
