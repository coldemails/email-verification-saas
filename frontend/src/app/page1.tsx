import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"></div>
            <span className="font-bold text-xl">OnlyValidEmails</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-medium">
              ✨ The simplest way to verify emails
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Only Valid Emails.
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Every Time.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Say goodbye to bounced emails. Clean your lists in minutes with 97% accuracy. 
            No subscriptions, no hassle—just results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              Start verifying for free →
            </Link>
            <Link 
              href="#pricing" 
              className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:border-purple-300 hover:shadow-lg transition-all duration-200"
            >
              View pricing
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Start in seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-6">Trusted by marketing teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
            <div className="text-2xl font-bold">ACME Corp</div>
            <div className="text-2xl font-bold">StartupCo</div>
            <div className="text-2xl font-bold">TechFlow</div>
            <div className="text-2xl font-bold">DataPro</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              A verifier like no other
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              OnlyValidEmails makes it simple to clean your email lists. No technical skills needed—just upload and verify.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Lightning fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Process 2,500 emails per minute. Verify 100k emails in under 40 minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">97% accuracy</h3>
              <p className="text-gray-600 leading-relaxed">
                Industry-leading accuracy on Gmail, Outlook, and all major providers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Best pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Pay as you go. No subscriptions. Credits never expire.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Privacy first</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is encrypted and automatically deleted after 30 days.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Real-time results</h3>
              <p className="text-gray-600 leading-relaxed">
                Watch your verification progress live with instant CSV export.
              </p>
            </div>
    
            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Simple to use</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload CSV → Verify → Download. That's it. No learning curve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Just three simple steps
            </h2>
            <p className="text-xl text-gray-600">
              No technical knowledge required. Start verifying in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload your CSV</h3>
              <p className="text-gray-600 leading-relaxed">
                Drag and drop your email list. We'll automatically detect the format.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Watch the magic</h3>
              <p className="text-gray-600 leading-relaxed">
                We verify each email with SMTP, DNS, and syntax checks in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Download results</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your clean list instantly. Only valid emails, ready to send.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pay as you go. No subscriptions. No hidden fees. Credits never expire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$2.95</span>
                </div>
                <p className="text-gray-500 mt-2">1,000 emails</p>
              </div>
              <Link 
                href="/register" 
                className="block w-full bg-gray-100 text-center text-gray-700 py-3 rounded-full font-medium hover:bg-gray-200 transition-colors mb-6"
              >
                Get started
              </Link>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">SMTP verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">DNS validation</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Instant CSV export</span>
                </div>
              </div>
            </div>

            {/* Popular - 10k */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl transform scale-105">
              <div className="absolute top-4 right-4 bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Growth</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$9.95</span>
                </div>
                <p className="text-purple-100 mt-2">10,000 emails</p>
              </div>
              <Link 
                href="/register" 
                className="block w-full bg-white text-purple-600 text-center py-3 rounded-full font-medium hover:bg-purple-50 transition-colors mb-6"
              >
                Get started
              </Link>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Everything in Starter</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Disposable email detection</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time progress</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Priority support</span>
                </div>
              </div>
            </div>

            {/* Enterprise - 100k */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$74.95</span>
                </div>
                <p className="text-gray-500 mt-2">100,000 emails</p>
              </div>
              <Link 
                href="/register" 
                className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-center text-white py-3 rounded-full font-medium hover:shadow-lg transition-all mb-6"
              >
                Get started
              </Link>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Everything in Growth</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Best value (60% savings)</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Dedicated support</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/pricing" 
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              View all pricing options →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Questions & answers
            </h2>
          </div>

          <div className="space-y-6">
            <details className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <summary className="font-semibold text-lg flex items-center justify-between">
                How accurate is the verification?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We achieve 97% accuracy on Gmail, Outlook, and all major email providers. We use multiple verification methods including SMTP, DNS, and syntax validation to ensure the highest accuracy.
              </p>
            </details>

            <details className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <summary className="font-semibold text-lg flex items-center justify-between">
                Do credits expire?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                No! Your credits never expire. Buy once and use them whenever you need. No pressure, no subscriptions.
              </p>
            </details>

            <details className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <summary className="font-semibold text-lg flex items-center justify-between">
                Is my data secure?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Absolutely. All data is encrypted in transit and at rest. We automatically delete your uploaded files after 30 days. We never share your data with third parties.
              </p>
            </details>

            <details className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <summary className="font-semibold text-lg flex items-center justify-between">
                How fast is the verification?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We process 2,500 emails per minute on average. A list of 100,000 emails typically takes around 40 minutes to complete.
              </p>
            </details>

            <details className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
              <summary className="font-semibold text-lg flex items-center justify-between">
                What file formats do you support?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We support CSV and TXT files. Your file should have one email address per line or in a column.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-16 text-white">
          <h2 className="text-5xl font-bold mb-6">
            Ready to clean your lists?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of marketers who trust OnlyValidEmails to keep their lists clean.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-medium hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Start verifying for free →
          </Link>
          <p className="text-sm mt-6 opacity-75">No credit card required • Start in seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl"></div>
                <span className="font-bold text-lg">OnlyValidEmails</span>
              </div>
              <p className="text-gray-600 text-sm">
                The simplest way to verify email addresses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-900">Pricing</Link></li>
                <li><Link href="#faq" className="hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-gray-900">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2025 OnlyValidEmails. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
