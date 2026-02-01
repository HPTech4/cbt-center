import { CheckCircle2 } from 'lucide-react'

/**
 * QuestionCard Component
 * Displays a single multiple-choice question with four options
 * Supports two modes:
 * 1. Exam mode: Allows selecting answers, shows selected option highlighted
 * 2. Review mode: Read-only, shows correct/incorrect answers with explanations
 * 
 * @param {Object} props - Component props
 * @param {Object} props.question - Question object with all details
 * @param {number} props.questionNumber - Question number for display
 * @param {string} props.selectedOption - Currently selected answer (A/B/C/D)
 * @param {Function} props.onSelectOption - Callback when option is selected
 * @param {boolean} [props.isReviewMode=false] - If true, shows read-only review UI
 * @param {boolean} [props.showCorrectAnswer=false] - If true, highlights correct/incorrect answers
 */
export default function QuestionCard({
  question,
  questionNumber,
  selectedOption,
  onSelectOption,
  isReviewMode = false,
  showCorrectAnswer = false
}) {
  const options = ['A', 'B', 'C', 'D']

  /**
   * Get the text for a specific option
   * @param {string} option - Option letter (A/B/C/D)
   * @returns {string} Option text from question object
   */
  const getOptionText = (option) => {
    return question[`option_${option.toLowerCase()}`]
  }

  /**
   * Determine CSS classes for option button based on state and mode
   * 
   * Exam mode styling:
   * - Selected option: blue border, blue background
   * - Unselected: slate border, hover effects
   * 
   * Review mode styling:
   * - Correct answer: green border, green background
   * - Wrong answer: red border, red background
   * - Unselected: slate, read-only appearance
   * 
   * @param {string} option - Option letter to style
   * @returns {string} Tailwind CSS classes for the button
   */
  const getOptionClass = (option) => {
    const baseClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200"
    
    if (!isReviewMode) {
      // Exam mode - highlight selected option
      if (selectedOption === option) {
        return `${baseClass} border-blue-600 bg-blue-50 font-medium`
      }
      return `${baseClass} border-slate-200 hover:border-blue-300 hover:bg-slate-50`
    } else {
      // Review mode - show correct/incorrect answers
      if (showCorrectAnswer) {
        // Correct answer is always shown in green
        if (option === question.correct_option) {
          return `${baseClass} border-green-600 bg-green-50 font-medium`
        }
        // Wrong answer selected by user is shown in red
        if (selectedOption === option && option !== question.correct_option) {
          return `${baseClass} border-red-600 bg-red-50 font-medium`
        }
      }
      return `${baseClass} border-slate-200 bg-slate-50`
    }
  }

  return (
    <div className="card">
      {/* Question Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {/* Question number badge */}
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Question {questionNumber}
            </span>
            
            {/* Review mode indicators */}
            {isReviewMode && question.is_correct && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
            {isReviewMode && !question.is_correct && selectedOption && (
              <span className="text-red-600 text-sm font-medium">Incorrect</span>
            )}
          </div>
          
          {/* Question text */}
          <p className="text-lg text-slate-800 leading-relaxed">
            {question.question_text}
          </p>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-3 mb-4">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => !isReviewMode && onSelectOption(option)}
            disabled={isReviewMode}
            className={getOptionClass(option)}
          >
            <div className="flex items-start gap-3">
              {/* Option letter circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold ${
                selectedOption === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {option}
              </div>
              {/* Option text */}
              <span className="flex-1 text-slate-700 pt-1">
                {getOptionText(option)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Explanation Section - Only shown in review mode */}
      {isReviewMode && showCorrectAnswer && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
          <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
          <p className="text-sm text-blue-800">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
