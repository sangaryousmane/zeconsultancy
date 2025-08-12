'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface TestResult {
  success: boolean
  message?: string
  error?: string
  suggestions?: string[]
  guide?: any
  config?: any
  otp?: string
}

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult | null>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)

  const runTest = async (action: string) => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email: testEmail })
      })

      const result = await response.json()
      setResults(result)
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const getConfigStatus = async () => {
    try {
      const response = await fetch('/api/admin/test-email')
      const result = await response.json()
      setConfigStatus(result)
    } catch (error) {
      console.error('Failed to get config status:', error)
    }
  }

  // Load config status on component mount
  useState(() => {
    getConfigStatus()
  })

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email System Testing</h1>
        <p className="text-muted-foreground">
          Test and diagnose email functionality for account verification and notifications.
        </p>
      </div>

      {/* Configuration Status */}
      {configStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {configStatus.config?.configured ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>EMAIL_USER:</strong> {configStatus.config?.variables.EMAIL_USER ? '✅ Set' : '❌ Missing'}
              </div>
              <div>
                <strong>EMAIL_PASS:</strong> {configStatus.config?.variables.EMAIL_PASS ? '✅ Set' : '❌ Missing'}
              </div>
              <div>
                <strong>EMAIL_FROM:</strong> {configStatus.config?.variables.EMAIL_FROM ? '✅ Set' : '❌ Missing'}
              </div>
              <div>
                <strong>EMAIL_HOST:</strong> {configStatus.config?.variables.EMAIL_HOST}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Tests</CardTitle>
          <CardDescription>
            Run various tests to diagnose email delivery issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Email Address
            </label>
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="mb-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => runTest('test-config')}
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Test Configuration
            </Button>

            <Button
              onClick={() => runTest('send-real-otp')}
              disabled={loading || !testEmail}
              variant="default"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Send Test OTP
            </Button>

            <Button
              onClick={() => runTest('troubleshoot')}
              disabled={loading}
              variant="secondary"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Get Troubleshooting Guide
            </Button>

            <Button
              onClick={getConfigStatus}
              variant="ghost"
            >
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.success ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {results.message}
                  {results.otp && (
                    <div className="mt-2 p-2 bg-muted rounded">
                      <strong>Test OTP:</strong> {results.otp}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">{results.error}</div>
                  {results.suggestions && results.suggestions.length > 0 && (
                    <div>
                      <strong>Suggestions:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {results.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Troubleshooting Guide */}
            {results.guide && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Troubleshooting Guide</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Setup Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {results.guide.setupSteps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Common Issues:</h4>
                    <div className="space-y-3">
                      {results.guide.commonIssues.map((issue: any, index: number) => (
                        <div key={index} className="border rounded p-3">
                          <h5 className="font-medium text-sm mb-1">{issue.issue}</h5>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {issue.solutions.map((solution: string, sIndex: number) => (
                              <li key={sIndex}>{solution}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}