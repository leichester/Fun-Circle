import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  },
  {
    id: 'how-to-organize-successful-community-events',
    title: 'How to Organize Successful Community Events That Bring Neighbors Together',
    excerpt: 'Learn the secrets to planning and hosting memorable community events that build lasting connections and strengthen neighborhood bonds.',
    content: `Community events are the heartbeat of thriving neighborhoods. Whether you're planning a block party, organizing a skill-sharing workshop, or hosting a social gathering, here's your complete guide to creating events that bring people together.

## Planning Your Community Event

### Start with Purpose
- Define clear goals for your event
- Consider what your community needs most
- Think about who you want to reach
- Set realistic expectations for attendance and outcomes

### Choose the Right Type of Event
Popular community events include:
- **Social Gatherings**: Block parties, potluck dinners, holiday celebrations
- **Learning Events**: Skill workshops, book clubs, gardening classes
- **Active Events**: Group walks, sports tournaments, outdoor activities
- **Family Events**: Movie nights, game days, craft sessions
- **Support Events**: Neighborhood cleanups, charity drives, volunteer projects

## Event Planning Essentials

### Timeline and Organization
**8 Weeks Before:**
- Set date, time, and location
- Create event budget
- Begin promoting the event
- Secure necessary permits if needed

**4 Weeks Before:**
- Confirm all logistics
- Send reminder announcements
- Prepare materials and supplies
- Recruit volunteers if needed

**1 Week Before:**
- Final headcount and preparations
- Confirm weather contingencies
- Prepare welcome materials
- Set up communication channels

### Location and Logistics
**Venue Considerations:**
- Accessibility for all community members
- Adequate space for expected attendance
- Weather backup plans for outdoor events
- Parking and transportation options
- Safety and security measures

**Essential Supplies:**
- Tables, chairs, and setup materials
- Sound system if needed
- Name tags and sign-in sheets
- Refreshments and serving supplies
- Cleanup materials

## Building Community Engagement

### Promotion Strategies
- Use multiple communication channels
- Create eye-catching flyers and social media posts
- Word-of-mouth through neighborhood networks
- Partner with local businesses and organizations
- Door-to-door invitations for smaller events

### Making Events Inclusive
- Consider diverse cultural backgrounds
- Accommodate different age groups
- Ensure accessibility for people with disabilities
- Offer activities for various interests and skill levels
- Create welcoming spaces for newcomers

### Encouraging Participation
- Ask community members to contribute ideas
- Create opportunities for people to volunteer
- Include interactive activities and games
- Provide name tags and ice-breaker activities
- Foster conversations between neighbors

## During the Event

### Host Responsibilities
- Arrive early to set up and greet early attendees
- Make introductions between community members
- Keep activities flowing and energy positive
- Be prepared to handle unexpected situations
- Take photos to share later (with permission)

### Creating Connections
- Plan structured networking activities
- Create conversation starters and discussion topics
- Encourage skill and resource sharing
- Facilitate introductions between like-minded neighbors
- Document contact information for future events

### Managing Challenges
- Have backup plans for weather or low attendance
- Address conflicts or issues diplomatically
- Ensure everyone feels welcome and included
- Keep events on schedule while remaining flexible
- Handle cleanup efficiently with volunteer help

## Post-Event Follow-up

### Immediate Actions
- Thank attendees and volunteers
- Share photos and highlights
- Gather feedback for future improvements
- Follow up on connections made during the event
- Document lessons learned

### Building Long-term Community
- Create ongoing communication channels
- Plan follow-up events based on interest
- Help facilitate connections made at the event
- Recognize and appreciate community volunteers
- Use feedback to improve future events

## Event Ideas by Season

### Spring Events
- Garden sharing and planting parties
- Outdoor skill workshops
- Spring cleaning community projects
- Easter egg hunts and family gatherings

### Summer Events
- Block parties and barbecues
- Outdoor movie nights
- Sports tournaments and active events
- Ice cream socials and picnics

### Fall Events
- Harvest celebrations and potlucks
- Halloween parties and costume contests
- Back-to-school resource sharing
- Thanksgiving gratitude gatherings

### Winter Events
- Holiday celebrations and gift exchanges
- Indoor game nights and craft sessions
- Winter soup kitchens and warm meal sharing
- New Year planning and goal-setting workshops

## Special Considerations

### Safety and Legal Requirements
- Check local regulations and permit requirements
- Ensure proper insurance coverage if needed
- Plan for first aid and emergency situations
- Consider food safety guidelines for potlucks
- Have emergency contact information readily available

### Budget-Friendly Options
- Potluck-style events reduce food costs
- Partner with local businesses for sponsorships
- Use community spaces like parks or schools
- Ask for volunteer help instead of hiring services
- Focus on simple activities that don't require expensive materials

### Building Traditions
- Create annual events that people anticipate
- Develop signature activities or themes
- Pass planning responsibilities to different neighbors
- Document event history and traditions
- Encourage community ownership of events

## Measuring Success

### Attendance and Engagement
- Track attendance over time
- Note level of participation in activities
- Observe conversations and connections forming
- Gather informal feedback during the event

### Community Impact
- Monitor ongoing relationships formed
- Track participation in future community activities
- Note improvements in neighborhood communication
- Observe increased community pride and involvement

### Continuous Improvement
- Collect formal feedback after each event
- Adjust planning based on community preferences
- Experiment with new formats and activities
- Build on successful elements from previous events

Remember: The best community events are those that reflect the unique character and needs of your neighborhood. Start small, be authentic, and focus on creating genuine connections between neighbors. Every successful community starts with people who care enough to bring others together.

By following these guidelines and adapting them to your community's specific needs, you'll be well on your way to organizing events that not only bring people together but also strengthen the fabric of your neighborhood for years to come.`,
    author: 'Fun Circle Team',
    publishDate: '2025-09-05',
    category: 'Event Planning',
    tags: ['community events', 'event planning', 'neighborhood', 'social gatherings'],
    readTime: 12,
    image: '/blog/community-events.jpg'
  }
];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Tips & Guides', 'Market Insights', 'Safety & Security', 'Success Stories'];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  // Structured data for the blog
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Fun Circle Community Blog",
    "description": "Tips, guides, and insights for community service providers and seekers",
    "url": "https://fun-circle.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Fun Circle",
      "url": "https://fun-circle.com"
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `https://fun-circle.com/blog/${post.id}`,
      "datePublished": post.publishDate,
      "author": {
        "@type": "Organization",
        "name": post.author
      },
      "keywords": post.tags.join(", "),
      "wordCount": Math.floor(post.content.length / 5)
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Community Service Tips & Guides - Fun Circle Blog"
        description="Expert tips, safety guides, and insights for community service providers and seekers. Learn how to build trust, find opportunities, and stay safe while helping your neighbors."
        keywords="community service tips, local service guides, neighborhood help, service provider advice, community safety, trust building, service marketing"
        url="https://fun-circle.com/blog"
        type="website"
        structuredData={blogStructuredData}
      />
      
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Community Service Resource Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert tips, guides, and insights to help you succeed in the community service marketplace. 
            Whether you're offering services or seeking help, we've got you covered.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {post.image && (
                <div className="h-48 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">📖 {post.category}</span>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {post.readTime} min read
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  <Link to={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    By {post.author} • {new Date(post.publishDate).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/blog/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Community Service Journey?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of community members who are already connecting, helping, and thriving together on Fun Circle.
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
      </div>
    </div>
  );
};

export default Blog;
