import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!email || !password || !confirmPassword) {
        setError('All fields are required')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (!email.includes('@')) {
        setError('Invalid email address')
        return
      }

      await register(email, password, fullName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gray-800/50 border border-white/10 rounded-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 text-center">Create Account</h1>
          <p className="text-white/40 text-sm text-center mb-6">Sign up for RecoAI today</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block">Full Name (Optional)</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-white/40 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="glow"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-white/60 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
