import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background/80">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl text-center">
          {/* Announcement Badge */}
          <motion.div 
            className="mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge variant="default" className="inline-flex items-center gap-2 px-4 py-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              New • AI-Powered Voice Calling Platform
            </Badge>
          </motion.div>

          {/* Main Hero Content */}
          <div className="space-y-6">
            <motion.h1 
              className="text-5xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Transform Your
              <motion.span 
                className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Sales Calls
              </motion.span>
              with AI
            </motion.h1>
            
            <motion.p 
              className="mx-auto max-w-3xl text-lg text-slate-600 md:text-xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              DialMate combines intelligent lead management with AI-powered voice calling. 
              Automate outreach, track conversations, and convert more prospects with real-time insights.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/signup" 
                  className="group relative inline-flex items-center justify-center rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-secondary/90 hover:shadow-xl"
                >
                  Start Free Trial
                  <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center rounded-lg border-2 border-accent/50 px-8 py-4 text-lg font-semibold text-primary transition-all hover:bg-accent/10 hover:border-accent"
                >
                  Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="pt-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <p className="text-sm text-slate-500 mb-6">Trusted by sales teams worldwide</p>
              <motion.div 
                className="flex items-center justify-center gap-8 opacity-60"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.6 }}
                transition={{ duration: 0.8, delay: 1.4, staggerChildren: 0.2 }}
              >
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-secondary to-accent"></div>
                  <span className="text-sm font-medium text-slate-600">Enterprise Ready</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-600">99.9% Uptime</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <span className="text-sm font-medium text-slate-600">GDPR Compliant</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="py-24 px-6 sm:px-8 lg:px-12 bg-white/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-primary md:text-4xl mb-4">
              Everything you need to scale your sales
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-slate-600">
              From lead management to AI-powered calling, we've got every aspect of your sales process covered.
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-secondary to-accent text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary">AI Voice Calling</h3>
                  <p className="text-slate-600">
                    Intelligent voice calls powered by VAPI technology. Natural conversations with real-time transcription and analysis.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Lead Management</h3>
                  <p className="text-slate-600">
                    Organize, score, and track your leads with intelligent prioritization and automated follow-up sequences.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Real-time Analytics</h3>
                  <p className="text-slate-600">
                    Comprehensive dashboards with call metrics, conversion rates, and performance insights to optimize your strategy.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Smart Scheduling</h3>
                  <p className="text-slate-600">
                    Automated call scheduling with timezone optimization and intelligent retry logic for maximum connection rates.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Call Transcripts</h3>
                  <p className="text-slate-600">
                    Automatic call transcription and sentiment analysis to improve conversation quality and track outcomes.
                  </p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary">Workflow Automation</h3>
                  <p className="text-slate-600">
                    Trigger actions based on call outcomes, automate follow-ups, and integrate with your existing CRM systems.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-secondary to-accent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div 
            className="grid gap-8 md:grid-cols-4 text-center text-white"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">2.5x</div>
              <div className="text-lg opacity-90">Higher Conversion Rate</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">87%</div>
              <div className="text-lg opacity-90">Time Savings</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-lg opacity-90">Calls Processed Daily</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-lg opacity-90">Customer Rating</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 px-6 sm:px-8 lg:px-12 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 
            className="text-3xl font-bold text-primary md:text-4xl mb-6"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to revolutionize your sales process?
          </motion.h2>
          <motion.p 
            className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of sales teams who've already transformed their outreach with DialMate's AI-powered calling platform.
          </motion.p>
          
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/signup" 
                className="group inline-flex items-center justify-center rounded-lg bg-secondary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-secondary/90 hover:shadow-xl"
              >
                Start Your Free Trial
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div 
              className="text-sm text-slate-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              No credit card required • 14-day free trial • Cancel anytime
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}

export default Landing