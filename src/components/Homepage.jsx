import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase, Users, TrendingUp, Award, Zap, Target, BookOpen, Star } from 'lucide-react';
import '../styles/homepage.css';

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

  const testimonials = [];

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="homepage-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">⚡</span>
            Quantiverse
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => navigate('/signin')}>Sign In</button>
            <button className="nav-cta" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="bg-gradient-shape shape-1"></div>
          <div className="bg-gradient-shape shape-2"></div>
          <div className="bg-gradient-shape shape-3"></div>
        </div>
        <div className="hero-wrapper">
          <div className="hero-content">
            <div className="hero-badge">✨ Launch Your Career</div>
            <h1 className="hero-heading">Learn by Doing.<br />Get Hired Faster.</h1>
            <p className="hero-subheading">
              Get hands-on experience with real job simulations from Google, Microsoft, Meta, 
              and more. Build a portfolio that gets you noticed.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Start Free Today
                <ChevronRight className="btn-icon" />
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/signin')}>
                Explore Programs
              </button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="featured-programs-section">
        <div className="section-header">
          <h2 className="section-title">Featured Programs</h2>
          <p className="section-subtitle">Learn in-demand skills through hands-on job simulations</p>
        </div>
        <div className="programs-grid">
          {programs.map((program, idx) => (
            <div key={idx} className="program-card">
              <div className="program-header">
                <div className="program-icon">{program.icon}</div>
                <span className="program-level">{program.level}</span>
              </div>
              <h3 className="program-title">{program.title}</h3>
              <p className="program-description">{program.description}</p>
              <p className="program-company">{program.company}</p>
              <button className="program-btn" onClick={() => navigate('/signin')}>
                Explore <ChevronRight className="inline-icon" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="why-header">
          <h2 className="section-title">Why Quantiverse?</h2>
          <p className="section-subtitle">Everything you need to succeed in your career</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon why-icon-1">
              <Briefcase className="icon-svg" />
            </div>
            <h3>Real Job Simulations</h3>
            <p>Experience actual workplace scenarios from leading companies.</p>
          </div>

          <div className="why-card">
            <div className="why-icon why-icon-2">
              <Users className="icon-svg" />
            </div>
            <h3>Learn from Experts</h3>
            <p>Guided by real professionals who work at top companies.</p>
          </div>

          <div className="why-card">
            <div className="why-icon why-icon-3">
              <TrendingUp className="icon-svg" />
            </div>
            <h3>Track Your Progress</h3>
            <p>See measurable improvements and build your portfolio.</p>
          </div>

          <div className="why-card">
            <div className="why-icon why-icon-4">
              <Award className="icon-svg" />
            </div>
            <h3>Earn Certificates</h3>
            <p>Get recognized credentials to boost your career.</p>
          </div>

          <div className="why-card">
            <div className="why-icon why-icon-5">
              <Zap className="icon-svg" />
            </div>
            <h3>Learn at Your Pace</h3>
            <p>Flexible learning schedule that fits your lifestyle.</p>
          </div>

          <div className="why-card">
            <div className="why-icon why-icon-6">
              <BookOpen className="icon-svg" />
            </div>
            <h3>Lifetime Access</h3>
            <p>Keep learning with lifetime access to all materials.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Get started in 4 simple steps</p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">🔍</div>
            <h3 className="step-title">Browse Programs</h3>
            <p className="step-description">Explore simulations from companies you admire.</p>
          </div>

          <div className="step-connector">→</div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">⚙️</div>
            <h3 className="step-title">Complete Tasks</h3>
            <p className="step-description">Work through real-world challenges at your pace.</p>
          </div>

          <div className="step-connector">→</div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">💬</div>
            <h3 className="step-title">Get Feedback</h3>
            <p className="step-description">Receive insights from industry professionals.</p>
          </div>

          <div className="step-connector">→</div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-icon">🏆</div>
            <h3 className="step-title">Earn Certificate</h3>
            <p className="step-description">Add credentials that matter to employers.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title">Success Stories</h2>
        <p className="section-subtitle">See what our students are saying</p>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">{testimonial.image}</div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="star-icon" />)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-shape shape-1"></div>
          <div className="cta-shape shape-2"></div>
        </div>
        <div className="cta-content">
          <h2>Ready to Transform Your Career?</h2>
          <p>Join 10,000+ students building real skills through hands-on experience.</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>
            Get Started Free Today
            <ChevronRight className="btn-icon" />
          </button>
          <p className="cta-footer">No credit card required • Start in 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>⚡ Quantiverse</h4>
            <p>Building the future of career development through hands-on learning.</p>
          </div>
          <div className="footer-section">
            <h4>Programs</h4>
            <ul>
              <li><a href="#" onClick={() => navigate('/signin')}>Internships</a></li>
              <li><a href="#" onClick={() => navigate('/signin')}>Simulations</a></li>
              <li><a href="#" onClick={() => navigate('/signin')}>Certificates</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Quantiverse. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
