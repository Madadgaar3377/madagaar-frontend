import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { backendBaseUrl } from '../../../constants/apiUrl';
import LoadingPage from '../../../compontents/Loader';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiUrl = (backendBaseUrl || "").replace(/\/$/, "");
    
    const [property, setProperty] = useState(null);
    const [relatedProperties, setRelatedProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);

    // Helper function to extract property data
    const extractPropertyData = (property) => {
        if (property.type === "Individual") {
            const individual = property.individualProperty || {};
            return {
                _id: property._id,
                type: "Individual",
                title: individual.title,
                description: individual.description,
                propertyType: individual.propertyType,
                propertyId: individual.propertyId,
                city: individual.city,
                location: individual.location,
                price: individual.transaction?.price || individual.transaction?.monthlyRent,
                transactionType: individual.transaction?.type,
                transaction: individual.transaction,
                areaSize: individual.areaSize,
                areaUnit: individual.areaUnit,
                bedrooms: individual.bedrooms,
                bathrooms: individual.bathrooms,
                kitchenType: individual.kitchenType,
                furnishingStatus: individual.furnishingStatus,
                floor: individual.floor,
                totalFloors: individual.totalFloors,
                possessionStatus: individual.possessionStatus,
                zoningType: individual.zoningType,
                images: individual.images || [],
                video: individual.video,
                documents: individual.documents || [],
                amenities: individual.amenities,
                utilities: individual.utilities,
                contact: individual.contact,
                nearbyLandmarks: individual.nearbyLandmarks,
            };
        } else if (property.type === "Project") {
            const project = property.project || {};
            return {
                _id: property._id,
                type: "Project",
                title: project.projectName,
                description: project.description,
                propertyType: project.projectType,
                propertyId: project.propertyId,
                city: project.city,
                location: project.area || project.address,
                address: project.address,
                price: project.transaction?.priceRange || project.transaction?.price,
                transactionType: project.transaction?.type,
                transaction: project.transaction,
                areaSize: project.totalLandArea,
                areaUnit: project.landAreaUnit,
                totalUnits: project.totalUnits,
                units: project.units || [],
                images: project.images || [],
                video: project.video,
                documents: project.documents || [],
                amenities: project.amenities,
                utilities: project.utilities,
                contact: project.contact,
                nearbyLandmarks: project.nearbyLandmarks,
                projectStage: project.projectStage,
                infrastructureStatus: project.infrastructureStatus,
                developerBuilder: project.developerBuilder,
                highlights: project.highlights || [],
                expectedCompletionDate: project.expectedCompletionDate,
                possessionDate: project.possessionDate,
            };
        }
        return null;
    };

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            setLoading(true);
            try {
                // Fetch all properties
                const res = await fetch(`${apiUrl}/getAllProperties`);
                const payload = await res.json();

                if (payload.success && payload.properties) {
                    // Find the specific property
                    const foundProperty = payload.properties.find(p => p._id === id);
                    
                    if (foundProperty) {
                        const extracted = extractPropertyData(foundProperty);
                        setProperty(extracted);

                        // Get related properties (same city or property type, excluding current)
                        const related = payload.properties
                            .filter(p => p._id !== id)
                            .map(extractPropertyData)
                            .filter(Boolean)
                            .filter(p => 
                                p.city === extracted.city || 
                                p.propertyType === extracted.propertyType
                            )
                            .slice(0, 6);
                        
                        setRelatedProperties(related);
                    } else {
                        setError("Property not found");
                    }
                } else {
                    setError(payload.message || "Failed to load property");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load property details");
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [id, apiUrl]);

    if (loading) return <LoadingPage />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
                    <button
                        onClick={() => navigate('/properties')}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Back to Properties
                    </button>
                </div>
            </div>
        );
    }

    if (!property) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-gray-600 hover:text-red-600">Home</Link>
                        <span className="text-gray-400">/</span>
                        <Link to="/properties" className="text-gray-600 hover:text-red-600">Properties</Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-semibold">{property.title}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Quick Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            property.type === "Project" 
                                                ? "bg-blue-100 text-blue-800" 
                                                : "bg-purple-100 text-purple-800"
                                        }`}>
                                            {property.type}
                                        </span>
                                        {property.transactionType && (
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                property.transactionType === "Sale" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : property.transactionType === "Rent"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-orange-100 text-orange-800"
                                            }`}>
                                                For {property.transactionType}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm font-semibold">{property.city}{property.location ? `, ${property.location}` : ""}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-red-600">
                                        {typeof property.price === "number" 
                                            ? `PKR ${property.price.toLocaleString()}` 
                                            : property.price || "Contact for Price"}
                                    </div>
                                    {property.propertyId && (
                                        <p className="text-xs text-gray-500 mt-1">ID: {property.propertyId}</p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                {property.areaSize && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{property.areaSize}</div>
                                        <div className="text-xs text-gray-600 mt-1">{property.areaUnit || "sq. ft"}</div>
                                    </div>
                                )}
                                {property.bedrooms && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                                        <div className="text-xs text-gray-600 mt-1">Bedrooms</div>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                                        <div className="text-xs text-gray-600 mt-1">Bathrooms</div>
                                    </div>
                                )}
                                {property.totalUnits && (
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{property.totalUnits}</div>
                                        <div className="text-xs text-gray-600 mt-1">Total Units</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {property.images && property.images.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Property Images</h2>
                                
                                {/* Main Image */}
                                <div className="mb-4">
                                    <img
                                        src={property.images[selectedImage]}
                                        alt={property.title}
                                        className="w-full h-64 md:h-96 object-cover rounded-xl"
                                    />
                                </div>

                                {/* Thumbnail Gallery */}
                                {property.images.length > 1 && (
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                        {property.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`relative h-16 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                    selectedImage === idx 
                                                        ? 'border-red-600 scale-105' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${property.title} ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        {property.description && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Description</h2>
                                <div 
                                    className="text-gray-700 leading-relaxed whitespace-pre-line prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: property.description }}
                                />
                            </div>
                        )}

                        {/* Project Highlights */}
                        {property.type === "Project" && property.highlights && property.highlights.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Key Highlights</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {property.highlights.filter(h => h).map((highlight, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-gray-700">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Units & Pricing (for Projects) */}
                        {property.type === "Project" && property.units && property.units.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Available Units & Pricing</h2>
                                <div className="space-y-4">
                                    {property.units.map((unit, idx) => (
                                        <div key={idx} className="border-2 border-gray-100 rounded-xl p-4 hover:border-red-200 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{unit.offeringType}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {unit.unitSize} {unit.unitSizeUnit} • {unit.numberOfUnits} units available
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {unit.transaction?.price && (
                                                        <div className="text-xl font-bold text-red-600">
                                                            PKR {parseInt(unit.transaction.price).toLocaleString()}
                                                        </div>
                                                    )}
                                                    {unit.transaction?.priceRange && (
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {unit.transaction.priceRange}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features & Amenities */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-black text-gray-900 mb-4">Features & Amenities</h2>
                            
                            {/* Utilities */}
                            {property.utilities && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-700 mb-3">Utilities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {property.utilities.electricity && (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⚡ Electricity</span>
                                        )}
                                        {property.utilities.water && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">💧 Water</span>
                                        )}
                                        {property.utilities.gas && (
                                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">🔥 Gas</span>
                                        )}
                                        {property.utilities.internet && (
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">📡 Internet</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Amenities */}
                            {property.amenities && (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-3">Amenities</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(property.amenities)
                                            .filter(([key, value]) => value === true)
                                            .map(([key]) => (
                                                <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nearby Landmarks */}
                        {property.nearbyLandmarks && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Nearby Landmarks</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.nearbyLandmarks}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        {property.contact && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Contact Information</h2>
                                <div className="space-y-3">
                                    {property.contact.name && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Name</p>
                                            <p className="font-semibold text-gray-900">{property.contact.name}</p>
                                        </div>
                                    )}
                                    {property.contact.number && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                                            <a href={`tel:${property.contact.number}`} className="font-semibold text-red-600 hover:text-red-700">
                                                {property.contact.number}
                                            </a>
                                        </div>
                                    )}
                                    {property.contact.email && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <a href={`mailto:${property.contact.email}`} className="font-semibold text-red-600 hover:text-red-700 break-all">
                                                {property.contact.email}
                                            </a>
                                        </div>
                                    )}
                                    {property.contact.whatsapp && (
                                        <a
                                            href={`https://wa.me/${property.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full mt-4 px-4 py-3 bg-green-600 text-white text-center rounded-lg font-bold hover:bg-green-700 transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                WhatsApp
                                            </div>
                                        </a>
                                    )}
                                    <button className="w-full mt-2 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">
                                        Send Inquiry
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Properties */}
                {relatedProperties.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Related Properties</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedProperties.map((related) => (
                                <Link
                                    key={related._id}
                                    to={`/property/${related._id}`}
                                    className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all overflow-hidden group"
                                >
                                    {related.images?.[0] ? (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={related.images[0]}
                                                alt={related.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400">No Image</span>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                related.type === "Project" 
                                                    ? "bg-blue-100 text-blue-800" 
                                                    : "bg-purple-100 text-purple-800"
                                            }`}>
                                                {related.type}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{related.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {related.city}{related.location ? `, ${related.location}` : ""}
                                        </p>
                                        <div className="text-lg font-bold text-red-600">
                                            {typeof related.price === "number" 
                                                ? `PKR ${related.price.toLocaleString()}` 
                                                : related.price || "Contact for Price"}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyDetails;
