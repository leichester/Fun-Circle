import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Navigation from '../components/Navigation';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
  readTime: number;
  image?: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 'how-to-build-trust-community-services',
    title: 'How to Build Trust When Offering Community Services',
    excerpt: 'Learn the essential steps to establish trust and credibility when offering your services to neighbors and community members.',
    content: `Building trust in a community service platform is crucial for both service providers and seekers. Here are proven strategies to establish credibility and create lasting relationships with your neighbors.

## Start with a Complete Profile
Your profile is your first impression. Include:
- A clear, professional photo
- Detailed description of your skills and experience
- Reviews and testimonials from previous work
- Certifications or qualifications relevant to your services

## Communication is Key
- Respond promptly to inquiries
- Be clear about what you can and cannot do
- Set realistic expectations about timing and outcomes
- Keep all communication professional and friendly

## Deliver Quality Consistently
- Always show up on time
- Come prepared with necessary tools and materials
- Pay attention to details
- Follow through on all commitments

## Build Your Reputation Gradually
- Start with smaller projects to build reviews
- Ask satisfied customers to leave feedback
- Share photos of completed work (with permission)
- Be transparent about your experience level

## Safety First
- Meet in public places for initial consultations
- Verify identities when possible
- Trust your instincts about potential clients
- Have clear agreements about scope and payment

## Handle Issues Professionally
- Address concerns immediately
- Take responsibility for mistakes
- Offer fair solutions to problems
- Learn from every experience

By following these guidelines, you'll build a strong reputation that leads to more opportunities and a thriving service business in your community.`,
    author: 'Fun Circle Team',
    publishDate: '2025-09-08',
    category: 'Tips & Guides',
    tags: ['trust', 'community', 'service providers', 'reputation'],
    readTime: 5,
    image: '/blog/trust-building.jpg'
  },
  {
    id: 'top-10-most-requested-community-services',
    title: 'Top 10 Most Requested Community Services in 2025',
    excerpt: 'Discover the most in-demand services in local communities and learn how to position yourself in growing markets.',
    content: `Based on data from thousands of community service requests, here are the top 10 most sought-after services in 2025.

## 1. Tech Support & Digital Assistance
With technology constantly evolving, many people need help with:
- Setting up smart home devices
- Troubleshooting computer issues
- Social media management for small businesses
- Online security and privacy protection

## 2. Home Cleaning & Organization
Professional cleaning services remain in high demand:
- Regular house cleaning
- Deep cleaning services
- Organizational consulting
- Move-in/move-out cleaning

## 3. Tutoring & Educational Support
Education needs continue to grow:
- Academic subject tutoring
- Language learning assistance
- Music and art lessons
- Test preparation

## 4. Handyman & Home Repair
Essential home maintenance services:
- Plumbing repairs
- Electrical work
- Carpentry and furniture assembly
- Painting and touch-ups

## 5. Pet Care Services
Pet ownership has increased significantly:
- Dog walking and pet sitting
- Pet grooming
- Training services
- Veterinary assistance transportation

## 6. Childcare & Babysitting
Flexible childcare options are always needed:
- Evening and weekend babysitting
- After-school care
- Special event childcare
- Emergency backup care

## 7. Lawn Care & Gardening
Outdoor maintenance remains popular:
- Regular lawn mowing
- Garden design and planting
- Tree trimming and removal
- Seasonal cleanup

## 8. Personal Shopping & Errands
Convenience services are growing:
- Grocery shopping
- Prescription pickup
- Gift shopping and wrapping
- General errand running

## 9. Fitness & Wellness Coaching
Health-focused services are trending:
- Personal fitness training
- Nutrition consulting
- Yoga and meditation instruction
- Wellness coaching

## 10. Event Planning & Coordination
Community events and celebrations:
- Birthday party planning
- Small event coordination
- Catering assistance
- Photography services

## Tips for Service Providers
- Research demand in your specific area
- Start with services that match your skills
- Consider seasonal fluctuations
- Build expertise gradually
- Network with other service providers

Understanding these trends can help you identify opportunities and position your services effectively in the growing community service market.`,
    author: 'Fun Circle Team',
    publishDate: '2025-09-07',
    category: 'Market Insights',
    tags: ['trends', 'services', 'demand', 'opportunities'],
    readTime: 7,
    image: '/blog/trending-services.jpg'
  },
  {
    id: 'safety-tips-community-service-exchanges',
    title: 'Essential Safety Tips for Community Service Exchanges',
    excerpt: 'Protect yourself and others when participating in community service exchanges with these important safety guidelines.',
    content: `Safety should always be your top priority when offering or requesting services in your community. Here's a comprehensive guide to staying safe while building meaningful connections with your neighbors.

## Before Meeting
### Verify Identity
- Exchange full names and phone numbers
- Check social media profiles when available
- Ask for references from previous clients or service providers
- Video call before meeting in person when possible

### Research and Communicate
- Discuss the service details thoroughly beforehand
- Clarify expectations, timeline, and payment
- Share your plans with a trusted friend or family member
- Trust your instincts about any red flags

## During Initial Meetings
### Choose Safe Locations
- Meet in public places for consultations
- Well-lit, busy areas are best
- Coffee shops, libraries, or community centers work well
- Avoid isolated locations for first meetings

### Bring Support
- Consider bringing a friend to initial meetings
- Let someone know your exact location and expected return time
- Keep your phone charged and easily accessible
- Have emergency contacts readily available

## For Home Services
### Preparation
- Clean and organize the work area beforehand
- Secure valuables and personal items
- Ensure pets are safely contained
- Have a clear escape route planned

### During Service
- Stay present and aware during the work
- Keep main entrances unlocked
- Maintain open communication
- Don't hesitate to speak up if something feels wrong

## Payment Safety
### Secure Transactions
- Use digital payment methods when possible
- Avoid carrying large amounts of cash
- Get receipts for all transactions
- Consider escrow services for large projects

### Contracts and Agreements
- Put agreements in writing
- Include scope, timeline, and payment terms
- Take photos of work areas before and after
- Keep copies of all documentation

## For Service Providers
### Professional Practices
- Carry proper identification
- Have insurance if applicable
- Bring your own tools and supplies when possible
- Maintain professional boundaries

### Ongoing Safety
- Schedule services during daylight hours when possible
- Inform clients about any helpers or assistants
- Be punctual and communicative
- End services immediately if you feel unsafe

## For Service Seekers
### Vetting Providers
- Check reviews and references carefully
- Start with smaller projects to build trust
- Verify any claimed certifications or licenses
- Ask detailed questions about their process

### Ongoing Protection
- Monitor the work closely
- Don't leave service providers alone initially
- Pay only for completed work
- Report any issues immediately

## Emergency Preparedness
### Have a Plan
- Keep emergency contacts easily accessible
- Know local emergency numbers
- Have a code word with trusted contacts
- Consider personal safety apps

### If Something Goes Wrong
- Remove yourself from the situation immediately
- Contact local authorities if necessary
- Report incidents to platform administrators
- Seek support from friends, family, or professionals

## Building Long-term Safety
### Community Building
- Get to know your neighbors
- Participate in community events
- Build a network of trusted service providers
- Share positive experiences and recommendations

### Continuous Learning
- Stay updated on safety best practices
- Learn from others' experiences
- Attend community safety workshops when available
- Trust your instincts and experience

Remember: No service or project is worth compromising your safety. When in doubt, don't proceed. The community service exchange should be a positive, safe experience for everyone involved.

By following these guidelines, you can enjoy the benefits of community service exchanges while protecting yourself and others. Safety awareness helps build stronger, more trusting communities where everyone can thrive.`,
    author: 'Fun Circle Team',
    publishDate: '2025-09-06',
    category: 'Safety & Security',
    tags: ['safety', 'security', 'protection', 'guidelines'],
    readTime: 8,
    image: '/blog/safety-tips.jpg'
  }
];

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const post = blogPosts.find(p => p.id === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Structured data for individual blog post
  const postStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "url": `https://fun-circle.com/blog/${post.id}`,
    "datePublished": post.publishDate,
    "dateModified": post.publishDate,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://fun-circle.com"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://fun-circle.com/#organization",
      "name": "Fun Circle",
      "url": "https://fun-circle.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://fun-circle.com/logo.svg"
      }
    },
    "keywords": post.tags.join(", "),
    "wordCount": Math.floor(post.content.length / 5),
    "articleSection": post.category,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://fun-circle.com/blog/${post.id}`
    }
  };

  // Convert markdown-style content to HTML
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-2 text-gray-700">{line.substring(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-gray-700 mb-4 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        url={`https://fun-circle.com/blog/${post.id}`}
        type="article"
        structuredData={postStructuredData}
      />
      
      <Navigation />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>•</span>
          <Link to="/blog" className="hover:text-blue-600">Blog</Link>
          <span>•</span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm">
              {post.readTime} min read
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between text-gray-600 text-sm border-b border-gray-200 pb-6">
            <div>
              By <span className="font-medium">{post.author}</span> • 
              <time dateTime={post.publishDate} className="ml-1">
                {new Date(post.publishDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
            </div>
            
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-lg text-gray-600 mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            {post.excerpt}
          </div>
          
          <div className="space-y-4">
            {formatContent(post.content)}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Put This Into Action?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join Fun Circle today and start building meaningful connections in your community while sharing your skills and services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/i-offer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Offer Your Services
            </Link>
            <Link
              to="/i-need"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Find Services
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">More Helpful Resources</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mb-3 inline-block">
                    {relatedPost.category}
                  </span>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {relatedPost.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {relatedPost.excerpt}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
