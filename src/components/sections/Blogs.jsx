import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Blogs.css'
import Header from '../common/Header';

function Blogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Sample blog data
    const blogPosts = [
        {
            id: 1,
            title: "The Future of HR: AI-Powered Recruitment",
            excerpt: "Discover how artificial intelligence is revolutionizing the hiring process and what it means for HR professionals.",
            category: "Technology",
            author: "Sarah Johnson",
            date: "Dec 15, 2024",
            readTime: "5 min read",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
            featured: true
        },
        {
            id: 2,
            title: "Building a Positive Company Culture",
            excerpt: "Learn the essential strategies for creating and maintaining a positive workplace culture that drives employee engagement.",
            category: "Culture",
            author: "Michael Chen",
            date: "Dec 12, 2024",
            readTime: "7 min read",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
            featured: true
        },
        {
            id: 3,
            title: "Remote Work Best Practices for HR",
            excerpt: "Essential guidelines for managing remote teams effectively and maintaining productivity in a distributed workforce.",
            category: "Remote Work",
            author: "Emily Rodriguez",
            date: "Dec 10, 2024",
            readTime: "6 min read",
            image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=250&fit=crop",
            featured: false
        },
        {
            id: 4,
            title: "Employee Retention Strategies That Work",
            excerpt: "Proven methods to reduce turnover and keep your best employees engaged and motivated.",
            category: "Retention",
            author: "David Kim",
            date: "Dec 8, 2024",
            readTime: "8 min read",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
            featured: false
        },
        {
            id: 5,
            title: "Diversity and Inclusion in the Workplace",
            excerpt: "Creating an inclusive environment that celebrates diversity and drives innovation.",
            category: "Diversity",
            author: "Lisa Thompson",
            date: "Dec 5, 2024",
            readTime: "9 min read",
            image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",
            featured: false
        },
        {
            id: 6,
            title: "Performance Management in the Digital Age",
            excerpt: "Modern approaches to performance reviews and employee development in today's fast-paced business environment.",
            category: "Performance",
            author: "Robert Wilson",
            date: "Dec 3, 2024",
            readTime: "6 min read",
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop",
            featured: false
        }
    ];

    const categories = [
        { id: 'all', name: 'All Posts', count: blogPosts.length },
        { id: 'Technology', name: 'Technology', count: blogPosts.filter(post => post.category === 'Technology').length },
        { id: 'Culture', name: 'Culture', count: blogPosts.filter(post => post.category === 'Culture').length },
        { id: 'Remote Work', name: 'Remote Work', count: blogPosts.filter(post => post.category === 'Remote Work').length },
        { id: 'Retention', name: 'Retention', count: blogPosts.filter(post => post.category === 'Retention').length },
        { id: 'Diversity', name: 'Diversity', count: blogPosts.filter(post => post.category === 'Diversity').length },
        { id: 'Performance', name: 'Performance', count: blogPosts.filter(post => post.category === 'Performance').length }
    ];

    const featuredPosts = blogPosts.filter(post => post.featured);
    const regularPosts = blogPosts.filter(post => !post.featured);

    const filteredPosts = regularPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="blogs-page">
            <Header />
            
            {/* Hero Section */}
            <section className="blogs-hero">
                <div className="blogs-container">
                    <div className="blogs-hero-content">
                        <h1>HR Insights & Resources</h1>
                        <p>Stay updated with the latest trends, best practices, and insights in human resources management</p>
                    </div>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="blogs-search-section">
                <div className="blogs-container">
                    <div className="blogs-search-filter-container">
                        <div className="blogs-search-box">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="blogs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </div>
                        
                        <div className="blogs-category-filters">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`blogs-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.name}
                                    <span className="blogs-count">({category.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Articles */}
            <section className="blogs-featured-articles">
                <div className="blogs-container">
                    <h2>Featured Articles</h2>
                    <div className="blogs-featured-grid">
                        {featuredPosts.map(post => (
                            <article key={post.id} className="blogs-featured-card">
                                <div className="blogs-card-image">
                                    <img src={post.image} alt={post.title} />
                                    <div className="blogs-category-badge">{post.category}</div>
                                </div>
                                <div className="blogs-card-content">
                                    <div className="blogs-card-meta">
                                        <span className="author">{post.author}</span>
                                        <span className="date">{post.date}</span>
                                        <span className="read-time">{post.readTime}</span>
                                    </div>
                                    <h3>{post.title}</h3>
                                    <p>{post.excerpt}</p>
                                    <Link to={`/blog/${post.id}`} className="blogs-read-more">
                                        Read More
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m9 18 6-6-6-6"/>
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Articles */}
            <section className="blogs-all-articles">
                <div className="blogs-container">
                    <div className="blogs-articles-header">
                        <h2>All Articles</h2>
                        <p>{filteredPosts.length} articles found</p>
                    </div>
                    
                    {filteredPosts.length > 0 ? (
                        <div className="blogs-articles-grid">
                            {filteredPosts.map(post => (
                                <article key={post.id} className="blogs-article-card">
                                    <div className="blogs-card-image">
                                        <img src={post.image} alt={post.title} />
                                        <div className="blogs-category-badge">{post.category}</div>
                                    </div>
                                    <div className="blogs-card-content">
                                        <div className="blogs-card-meta">
                                            <span className="author">{post.author}</span>
                                            <span className="date">{post.date}</span>
                                            <span className="read-time">{post.readTime}</span>
                                        </div>
                                        <h3>{post.title}</h3>
                                        <p>{post.excerpt}</p>
                                        <Link to={`/blog/${post.id}`} className="blogs-read-more">
                                            Read More
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="m9 18 6-6-6-6"/>
                                            </svg>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="blogs-no-results">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <h3>No articles found</h3>
                            <p>Try adjusting your search terms or category filter</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="blogs-newsletter-section">
                <div className="blogs-container">
                    <div className="blogs-newsletter-content">
                        <h2>Stay Updated</h2>
                        <p>Get the latest HR insights delivered to your inbox</p>
                        <form className="blogs-newsletter-form">
                            <input type="email" placeholder="Enter your email address" />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Blogs;