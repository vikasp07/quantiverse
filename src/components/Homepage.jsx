import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, Users, TrendingUp, Award, Zap, BookOpen } from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();

  const programs = [
    { 
      title: 'Data Analytics', 
      company: 'Virtual Role', 
      icon: '📊',
      description: 'Master data-driven decision making',
      level: 'Intermediate'
    },
    { 
      title: 'Product Management', 
      company: 'Virtual Role', 
      icon: '🎯',
      description: 'Build products users love',
      level: 'Intermediate'
    },
    { 
      title: 'Software Engineering', 
      company: 'Virtual Role', 
      icon: '💻',
      description: 'Write code that changes the world',
      level: 'Advanced'
    },
    { 
      title: 'Marketing Strategy', 
      company: 'Virtual Role', 
      icon: '📈',
      description: 'Launch campaigns that scale',
      level: 'Beginner'
    },
  ];

  const stats = [
    { label: 'Active Learners', value: '10K+' },
    { label: 'Programs', value: '50+' },
    { label: 'Companies', value: '100+' },
    { label: 'Success Rate', value: '95%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg text-slate-900">Quantiverse</span>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => navigate('/signin')} className="text-slate-600 hover:text-slate-900 font-medium transition">Sign In</button>
            <button onClick={() => navigate('/signup')} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">✨ Launch Your Career</div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Learn by Doing.<br/>Get Hired Faster.
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-8">
                Get hands-on experience with real job simulations from Google, Microsoft, Meta, and more. Build a portfolio that gets you noticed.
              </p>
              <div className="flex gap-4 flex-wrap">
                <button onClick={() => navigate('/signup')} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-md transition">
                  Start Free Today
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/signin')} className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg font-semibold transition">
                  Explore Programs
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Programs</h2>
            <p className="text-xl text-slate-600">Learn in-demand skills through hands-on job simulations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl">
                  {program.icon}
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md inline-block mb-3">{program.level}</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{program.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{program.description}</p>
                  <p className="text-xs text-slate-500 mb-4">{program.company}</p>
                  <button onClick={() => navigate('/signin')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    Explore <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Quantiverse?</h2>
            <p className="text-xl text-slate-300">Everything you need to succeed in your career</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, title: 'Real Job Simulations', desc: 'Experience actual workplace scenarios from leading companies.' },
              { icon: Users, title: 'Learn from Experts', desc: 'Guided by real professionals who work at top companies.' },
              { icon: TrendingUp, title: 'Track Your Progress', desc: 'See measurable improvements and build your portfolio.' },
              { icon: Award, title: 'Earn Certificates', desc: 'Get recognized credentials to boost your career.' },
              { icon: Zap, title: 'Learn at Your Pace', desc: 'Flexible learning schedule that fits your lifestyle.' },
              { icon: BookOpen, title: 'Lifetime Access', desc: 'Keep learning with lifetime access to all materials.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition">
                <item.icon className="w-8 h-8 text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 text-emerald-50">Join 10,000+ students building real skills through hands-on experience.</p>
          <button onClick={() => navigate('/signup')} className="px-8 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-slate-100 transition flex items-center justify-center gap-2 mx-auto shadow-lg">
            Get Started Free Today
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-sm mt-4 text-emerald-100">No credit card required • Start in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">⚡ Quantiverse</h4>
              <p className="text-slate-400">Building the future of career development through hands-on learning.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Programs</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" onClick={() => navigate('/signin')} className="hover:text-white transition">Internships</a></li>
                <li><a href="#" onClick={() => navigate('/signin')} className="hover:text-white transition">Simulations</a></li>
                <li><a href="#" onClick={() => navigate('/signin')} className="hover:text-white transition">Certificates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 Quantiverse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
