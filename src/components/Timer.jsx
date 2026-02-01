import { useState, useEffect, useRef } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { updateTimeRemaining } from '../services/supabaseClient'

/**
 * Timer Component with Persistence
 * Features:
 * - Counts down from initial seconds
 * - Persists remaining time to database every 5 seconds
 * - Shows warning when less than 5 minutes remaining
 * - Triggers auto-submit when time reaches zero
 * 
 * This ensures:
 * - User doesn't lose progress if page refreshes (time persists to DB)
 * - Exam auto-submits when time expires
 * - Visual feedback when time is running out
 * 
 * @param {Object} props - Component props
 * @param {string} props.attemptId - ID of the exam attempt
 * @param {number} props.initialSeconds - Time limit in seconds
 * @param {Function} props.onTimeUp - Callback when timer reaches zero
 */
export default function Timer({ attemptId, initialSeconds, onTimeUp }) {
  // Current time remaining in seconds
  const [seconds, setSeconds] = useState(initialSeconds)
  // True when time < 5 minutes (warning state)
  const [isWarning, setIsWarning] = useState(false)
  // Reference to countdown interval
  const intervalRef = useRef(null)
  // Track last saved time to avoid frequent DB updates
  const lastSavedRef = useRef(initialSeconds)

  /**
   * Main countdown timer effect
   * Decrements seconds every 1000ms and triggers auto-submit at 0
   */
  useEffect(() => {
    // Start the countdown interval
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        // When time reaches zero
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          // Trigger callback to auto-submit exam
          onTimeUp()
          return 0
        }
        // Continue countdown
        return prev - 1
      })
    }, 1000)

    // Cleanup: Clear interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onTimeUp])

  /**
   * Persist time to database effect
   * Saves remaining time every 5 seconds to prevent loss on page refresh
   * Only saves if time has changed by 5+ seconds since last save
   */
  useEffect(() => {
    const persistInterval = setInterval(async () => {
      // Check if time has changed by 5+ seconds
      if (Math.abs(lastSavedRef.current - seconds) >= 5) {
        try {
          // Save current time to database
          await updateTimeRemaining(attemptId, seconds)
          // Update last saved reference
          lastSavedRef.current = seconds
        } catch (error) {
          // Silently fail - timer continues even if save fails
          console.error('Failed to persist time:', error)
        }
      }
    }, 5000) // Check every 5 seconds

    // Cleanup: Clear persistence interval on unmount
    return () => clearInterval(persistInterval)
  }, [attemptId, seconds])

  /**
   * Warning state effect
   * Shows visual warning when less than 5 minutes (300 seconds) remain
   */
  useEffect(() => {
    setIsWarning(seconds <= 300)
  }, [seconds])

  /**
   * Format seconds as MM:SS display format
   * Example: 125 seconds -> "02:05"
   * 
   * @param {number} totalSeconds - Total seconds to format
   * @returns {string} Formatted time string (MM:SS)
   */
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
        // Red styling when warning, blue when normal
        isWarning
          ? 'bg-red-100 text-red-700 timer-warning'
          : 'bg-blue-100 text-blue-700'
      }`}
    >
      {/* Icon changes based on warning state */}
      {isWarning ? (
        <AlertCircle className="w-5 h-5" />
      ) : (
        <Clock className="w-5 h-5" />
      )}
      {/* Display formatted time */}
      <span className="text-lg">{formatTime(seconds)}</span>
    </div>
  )
}
