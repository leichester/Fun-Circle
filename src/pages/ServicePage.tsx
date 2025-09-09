import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import Navigation from '../components/Navigation';
import FormattedText from '../components/FormattedText';
import { useOffers } from '../contexts/FirebaseOffersContext';

// Define service categories for SEO
const serviceCategories = {
  tutoring: {
    title: 'Tutoring Services',
    description: 'Find qualified tutors in your area. Get help with math, science, languages, music, and more from experienced local educators.',
    keywords: 'tutoring, math tutor, science tutor, language tutor, music lessons, academic help, private tutor, homework help',
    services: ['Math Tutoring', 'Science Tutoring', 'Language Learning', 'Music Lessons', 'Academic Support', 'Test Preparation']
  },
  handyman: {
    title: 'Handyman Services',
    description: 'Reliable handyman services for home repairs, maintenance, and improvements. Connect with skilled local professionals for all your home needs.',
    keywords: 'handyman, home repair, maintenance, plumbing, electrical, carpentry, painting, home improvement',
    services: ['Home Repairs', 'Plumbing', 'Electrical Work', 'Carpentry', 'Painting', 'Furniture Assembly']
  },
  'tech-support': {
    title: 'Tech Support Services',
    description: 'Get help with computers, smartphones, software, and technology issues from local tech experts and IT professionals.',
    keywords: 'tech support, computer repair, IT help, software installation, phone repair, technology assistance',
    services: ['Computer Repair', 'Software Help', 'Phone Support', 'Network Setup', 'Data Recovery', 'Tech Training']
  },
  cleaning: {
    title: 'Cleaning Services',
    description: 'Professional cleaning services for homes and offices. Find trusted local cleaners for regular maintenance or deep cleaning.',
    keywords: 'cleaning services, house cleaning, office cleaning, deep cleaning, maid service, carpet cleaning',
    services: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Post-Construction Cleanup']
  },
  gardening: {
    title: 'Gardening & Landscaping Services',
    description: 'Expert gardening and landscaping services. From lawn care to garden design, connect with green-thumbed neighbors.',
    keywords: 'gardening, landscaping, lawn care, garden design, tree trimming, yard work, plant care',
    services: ['Lawn Care', 'Garden Design', 'Tree Trimming', 'Yard Cleanup', 'Plant Care', 'Landscape Installation']
  },
  childcare: {
    title: 'Childcare & Babysitting Services',
    description: 'Trusted childcare and babysitting services from experienced local caregivers. Safe, reliable care for your children.',
    keywords: 'childcare, babysitting, nanny, child care, babysitter, kids care, family support',
    services: ['Babysitting', 'Nanny Services', 'After-School Care', 'Weekend Care', 'Special Needs Care', 'Emergency Childcare']
  },
  petcare: {
    title: 'Pet Care Services',
    description: 'Loving pet care services including dog walking, pet sitting, grooming, and veterinary assistance from fellow pet lovers.',
    keywords: 'pet care, dog walking, pet sitting, pet grooming, veterinary care, animal care, pet services',
    services: ['Dog Walking', 'Pet Sitting', 'Pet Grooming', 'Veterinary Care', 'Pet Training', 'Pet Boarding']
  },
  fitness: {
    title: 'Fitness & Personal Training',
    description: 'Personal fitness training and wellness services. Get in shape with certified trainers and fitness enthusiasts in your community.',
    keywords: 'fitness training, personal trainer, yoga, pilates, workout, exercise, wellness, health coaching',
    services: ['Personal Training', 'Yoga Classes', 'Pilates', 'Cardio Training', 'Strength Training', 'Wellness Coaching']
  },
  events: {
    title: 'Community Events & Social Gatherings',
    description: 'Discover and organize fun community events, social gatherings, and local activities. From birthday parties to book clubs, connect with neighbors through shared experiences.',
    keywords: 'community events, fun events, social gatherings, parties, meetups, local activities, event planning, neighborhood parties, social clubs, community activities',
    services: ['Birthday Parties', 'Social Meetups', 'Book Clubs', 'Game Nights', 'Potluck Dinners', 'Outdoor Activities', 'Holiday Celebrations', 'Skill Workshops']
  }
};

const ServicePage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { offers, loading } = useOffers();

  const [filteredOffers, setFilteredOffers] = useState<any[]>([]);

  // Redirect to home if invalid category
  const serviceConfig = category ? serviceCategories[category as keyof typeof serviceCategories] : null;
  
  useEffect(() => {
    if (!serviceConfig) {
      navigate('/');
      return;
    }

    // Filter offers based on category
    const categoryOffers = offers.filter(offer => {
      const title = offer.title?.toLowerCase() || '';
      const description = offer.description?.toLowerCase() || '';
      const categoryLower = category?.toLowerCase() || '';
      
      return title.includes(categoryLower) || description.includes(categoryLower) ||
             (categoryLower === 'tech-support' && (title.includes('tech') || title.includes('computer') || title.includes('software'))) ||
             (categoryLower === 'childcare' && (title.includes('child') || title.includes('baby') || title.includes('kid'))) ||
             (categoryLower === 'petcare' && (title.includes('pet') || title.includes('dog') || title.includes('cat'))) ||
             (categoryLower === 'events' && (title.includes('party') || title.includes('event') || title.includes('meetup') || title.includes('gathering') || title.includes('celebration') || description.includes('fun') || description.includes('social')));
    });

    setFilteredOffers(categoryOffers);
  }, [offers, category, serviceConfig, navigate]);

  if (!serviceConfig) {
    return null;
  }

  // Structured data for service category page
  const servicePageStructuredData = {
    "@context": "https://schema.org",
    "@type": category === 'events' ? "Event" : "Service",
    "name": serviceConfig.title,
    "description": serviceConfig.description,
    "provider": {
      "@type": "Organization",
      "name": "Fun Circle",
      "url": "https://fun-circle.com"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Local Community"
    },
    "serviceType": serviceConfig.title,
    "url": `https://fun-circle.com/services/${category}`,
    "offers": filteredOffers.slice(0, 10).map(offer => ({
      "@type": category === 'events' ? "Event" : "Offer",
      "name": offer.title,
      "description": offer.description,
      "url": `https://fun-circle.com/post/${offer.id}`,
      [category === 'events' ? 'organizer' : 'offeredBy']: {
        "@type": "Person",
        "name": offer.userDisplayName || offer.userEmail
      }
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={`${serviceConfig.title} in Your Local Community`}
        description={serviceConfig.description}
        keywords={serviceConfig.keywords}
        url={`https://fun-circle.com/services/${category}`}
        type="website"
        structuredData={servicePageStructuredData}
      />
      
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {serviceConfig.title} in Your Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {serviceConfig.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/i-need')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Find {serviceConfig.title}
            </button>
            <button
              onClick={() => navigate('/i-offer')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Offer {serviceConfig.title}
            </button>
          </div>
        </div>

        {/* Service Types */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular {serviceConfig.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceConfig.services.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700">{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Offers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available {serviceConfig.title} ({filteredOffers.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading services...</p>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid gap-6">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{offer.title}</h3>
                      <div className="text-gray-600 mb-4">
                        <FormattedText text={offer.description} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By: {offer.userDisplayName || offer.userEmail}</span>
                        <span>•</span>
                        <span>{new Date(offer.createdAt.toDate()).toLocaleDateString()}</span>
                        {offer.price && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-green-600">${offer.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      offer.type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {offer.type === 'offer' ? 'Offering' : 'Looking for'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {offer.online && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Online</span>
                      )}
                      {offer.location && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          📍 {offer.location}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/post/${offer.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {serviceConfig.title} Available Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to offer or request {serviceConfig.title} in your community!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/i-offer')}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Offer Service
                </button>
                <button
                  onClick={() => navigate('/i-need')}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Request Service
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
