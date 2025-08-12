'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props
    
    // Log the error
    logger.error('React Error Boundary caught an error', error, {
      errorInfo: errorInfo.componentStack,
      errorId: this.state.errorId,
      level,
      retryCount: this.retryCount,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    })

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Report to external error tracking service if needed
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Here you can integrate with error tracking services like Sentry, Bugsnag, etc.
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
      console.error('Error reported to tracking service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      })
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      logger.info('Retrying after error', {
        errorId: this.state.errorId,
        retryCount: this.retryCount,
      })
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      })
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state
    const errorDetails = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    }

    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
        .then(() => {
          // You could show a toast notification here
          console.log('Error details copied to clipboard')
        })
        .catch(console.error)
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state
    const { children, fallback, showDetails = false, level = 'component' } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Different UI based on error level
      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
            <Card className="w-full max-w-md glass-effect">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  Critical <span className="gradient-text">Error</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  A critical error has occurred. Please refresh the page or contact support.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showDetails && errorId && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <Bug className="h-4 w-4 text-primary" />
                    <AlertDescription className="font-mono text-xs text-primary">
                      Error ID: {errorId}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex flex-col gap-2">
                  <Button onClick={this.handleReload} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      if (level === 'page') {
        return (
          <div className="container mx-auto px-4 py-16 text-center bg-gradient-to-br from-background via-background to-muted/30 min-h-screen flex items-center justify-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">
                Something went <span className="gradient-text">wrong</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                We encountered an error while loading this page. Please try again.
              </p>
              
              {showDetails && errorId && (
                <Alert className="mb-6 text-left border-primary/20 bg-primary/5">
                  <Bug className="h-4 w-4 text-primary" />
                  <AlertDescription className="font-mono text-xs text-primary">
                    Error ID: {errorId}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}
                <Button variant="outline" onClick={this.handleGoHome}>
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        )
      }

      // Component level error
      return (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-semibold">Component Error</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This component failed to load. 
            {this.retryCount < this.maxRetries && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={this.handleRetry}
                className="p-0 h-auto text-primary underline ml-1"
              >
                Try again ({this.maxRetries - this.retryCount} left)
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )
    }

    return children
  }
}

export default ErrorBoundary

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specialized error boundaries for different use cases
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component" showDetails={process.env.NODE_ENV === 'development'}>
    {children}
  </ErrorBoundary>
)

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical" showDetails={process.env.NODE_ENV === 'development'}>
    {children}
  </ErrorBoundary>
)