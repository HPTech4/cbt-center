import { useNavigate } from 'react-router-dom'
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight, Award, Target, Users } from 'lucide-react'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Background */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden"
      >
        {/* Background image - students studying */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-3xl border border-white/20 shadow-2xl">
              <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Prime Scholar
          </h1>
          
          <p className="text-xl sm:text-2xl text-blue-100 mb-4 font-light animate-fade-in-up delay-100">
            Computer Based Testing System
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mb-8 rounded-full" />

          {/* Welcome Message */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 animate-fade-in-up delay-200">
            Welcome to Excellence
          </h2>

          <div className="max-w-3xl mx-auto space-y-4 text-lg text-blue-50 mb-12 animate-fade-in-up delay-300">
            <p className="leading-relaxed">
              At Prime Scholar, we are committed to providing world-class educational assessment solutions. 
              Our state-of-the-art Computer Based Testing platform is designed to help students achieve their 
              academic goals through comprehensive practice and evaluation.
            </p>
            <p className="leading-relaxed">
              With our extensive question bank covering WAEC, JAMB, NECO, and other major examinations, 
              you have access to thousands of practice questions that mirror real exam conditions. 
              Track your progress, identify areas for improvement, and excel in your studies.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/exam-select')}
            className="group bg-white text-indigo-900 px-10 sm:px-14 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 animate-fade-in-up delay-500"
          >
            Start Your Practice Journey
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Prime Scholar?
            </h2>
            <p className="text-lg text-slate-600">
              Comprehensive tools to ensure your academic success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Comprehensive Coverage</h3>
              <p className="text-slate-600 leading-relaxed">
                Access thousands of questions across all major exams including WAEC, JAMB, and NECO. 
                Complete subject coverage ensures thorough preparation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-indigo-100">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Performance Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor your progress with detailed analytics. Identify strengths and weaknesses 
                to focus your study efforts where they matter most.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real Exam Conditions</h3>
              <p className="text-slate-600 leading-relaxed">
                Practice with timed tests that simulate actual exam environments. 
                Build confidence and improve time management skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-16">
            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Prime Scholar</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering students to achieve academic excellence through quality education and innovative assessment solutions.
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Users className="w-4 h-4" />
                <span>Trusted by thousands of students</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <button 
                    onClick={() => navigate('/exam-select')}
                    className="hover:text-white transition-colors hover:translate-x-1 inline-block"
                  >
                    → Start Practice
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                    → About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                    → Exam Coverage
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">
                    → Help & Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Contact Us</h3>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start gap-3 group">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="group-hover:text-white transition-colors">
                    123 Education Avenue, Learning District, Lagos, Nigeria
                  </span>
                </div>
                <div className="flex items-center gap-3 group">
                  <Phone className="w-5 h-5 flex-shrink-0 text-blue-400" />
                  <a href="tel:+234800SCHOLAR" className="group-hover:text-white transition-colors">
                    +234 800 SCHOLAR
                  </a>
                </div>
                <div className="flex items-center gap-3 group">
                  <Mail className="w-5 h-5 flex-shrink-0 text-blue-400" />
                  <a href="mailto:info@primescholar.edu.ng" className="group-hover:text-white transition-colors">
                    info@primescholar.edu.ng
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Connect With Us</h3>
              <p className="text-sm text-slate-400 mb-4">
                Follow us for updates, tips, and educational content
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-800 hover:bg-blue-600 p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-800 hover:bg-sky-500 p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/50"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-800 hover:bg-pink-600 p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-600/50"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-800 hover:bg-blue-700 p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-700/50"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
              <p>&copy; {new Date().getFullYear()} Prime Scholar. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
