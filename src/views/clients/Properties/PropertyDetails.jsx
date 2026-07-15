"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShareButtons from '../../../components/ShareButtons';

const PropertyDetails = ({ initialProperty, initialRelated, fetchError }) => {
    const router = useRouter();
    
    const [property, setProperty] = useState(initialProperty);
    const [relatedProperties, setRelatedProperties] = useState(initialRelated);
    const [selectedImage, setSelectedImage] = useState(0);

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load property details</h2>
                    <button type="button"
                        onClick={() => router.push('/properties')}
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
                <div className="container-content py-3 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="text-gray-600 hover:text-red-600 flex-shrink-0">Home</Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/properties" className="text-gray-600 hover:text-red-600 flex-shrink-0">Properties</Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-none">{property.title}</span>
                    </div>
                </div>
            </div>

            <div className="container-content py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Quick Info */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${
                                            property.type === "Project" 
                                                ? "bg-blue-100 text-blue-800" 
                                                : "bg-purple-100 text-purple-800"
                                        }`}>
                                            {property.type}
                                        </span>
                                        {property.transactionType && (
                                            <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${
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
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="size-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-xs sm:text-sm font-semibold">{property.city}{property.location ? `, ${property.location}` : ""}</span>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    {/* Price Display - Different for Individual vs Project */}
                                    {property.type === "Individual" && property.transaction?.price && property.transaction.price > 0 ? (
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-black text-red-600">
                                                PKR {property.transaction.price.toLocaleString()}
                                            </div>
                                            {property.transaction?.priceRange && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {property.transaction.priceRange}
                                                </div>
                                            )}
                                        </div>
                                    ) : property.type === "Project" && property.transaction?.priceRange ? (
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-black text-red-600">
                                                {property.transaction.priceRange}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">Price Range</div>
                                        </div>
                                    ) : property.transaction?.monthlyRent ? (
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-black text-red-600">
                                                PKR {property.transaction.monthlyRent.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">per month</div>
                                        </div>
                                    ) : (
                                        <div className="text-2xl sm:text-3xl font-black text-red-600">
                                            Contact for Price
                                        </div>
                                    )}
                                    {property.propertyId && (
                                        <p className="text-xs text-gray-500 mt-1">ID: {property.propertyId}</p>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 pt-4 border-t">
                                {property.areaSize && (
                                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">{property.areaSize}</div>
                                        <div className="text-xs text-gray-600 mt-1">{property.areaUnit || "sq. ft"}</div>
                                    </div>
                                )}
                                {property.bedrooms && (
                                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                                        <div className="text-xs text-gray-600 mt-1">Bedrooms</div>
                                    </div>
                                )}
                                {property.bathrooms && (
                                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                                        <div className="text-xs text-gray-600 mt-1">Bathrooms</div>
                                    </div>
                                )}
                                {property.totalUnits && (
                                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                                        <div className="text-lg sm:text-2xl font-bold text-gray-900">{property.totalUnits}</div>
                                        <div className="text-xs text-gray-600 mt-1">Total Units</div>
                                    </div>
                                )}
                            </div>
                            <ShareButtons
                                url={property._id ? `https://madadgaar.com.pk/property/${property._id}` : ""}
                                title={property.title || "Property"}
                                details={[
                                    [property.city, property.location].filter(Boolean).join(", "),
                                    property.propertyType ? `${property.propertyType}` : null,
                                    property.transaction?.price > 0 ? `Price: PKR ${property.transaction.price.toLocaleString()}` : property.transaction?.monthlyRent ? `Rent: PKR ${property.transaction.monthlyRent.toLocaleString()}/month` : property.transaction?.priceRange ? `Price: ${property.transaction.priceRange}` : null,
                                    property.areaSize ? `Area: ${property.areaSize} ${property.areaUnit || "sq. ft"}` : null,
                                    (property.bedrooms || property.bathrooms) ? `🛏️ ${property.bedrooms || ""} Bed • 🚿 ${property.bathrooms || ""} Bath` : null,
                                ].filter(Boolean).join("\n")}
                                label="Share this property"
                            />
                        </div>

                        {/* Image Gallery */}
                        {property.images && property.images.length > 0 && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Property Images</h2>
                                
                                {/* Main Image */}
                                <div className="mb-3 sm:mb-4">
                                    <img
                                        src={property.images[selectedImage]}
                                        alt={`${property.title} - ${property.propertyType || "Property"} for ${property.transactionType || "sale"} in ${property.city || "Pakistan"}`}
                                        className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-lg sm:rounded-xl"
                                    />
                                </div>

                                {/* Thumbnail Gallery */}
                                {property.images.length > 1 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                        {property.images.map((img, idx) => (
                                            <button type="button"
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`relative h-14 sm:h-16 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                    selectedImage === idx 
                                                        ? 'border-red-600 scale-105' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${property.title} - Image ${idx + 1} - ${property.propertyType || "Property"} in ${property.city || "Pakistan"}`}
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
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Description</h2>
                                <div 
                                    className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: property.description }}
                                />
                            </div>
                        )}

                        {/* Project Highlights */}
                        {property.type === "Project" && property.highlights && property.highlights.length > 0 && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Key Highlights</h2>
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    {property.highlights.filter(h => h).map((highlight, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <svg className="size-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-gray-700">{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transaction Details Section */}
                        {property.transaction && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <svg className="size-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pricing & Transaction Details
                                </h2>
                                <div className="space-y-4">
                                    {/* Transaction Type */}
                                    {property.transaction.type && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-semibold text-gray-700">Transaction Type</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                property.transaction.type === 'Sale' ? 'bg-green-100 text-green-800' :
                                                property.transaction.type === 'Rent' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {property.transaction.type}
                                            </span>
                                        </div>
                                    )}

                                    {/* Sale Details */}
                                    {property.transaction.type === 'Sale' && (
                                        <>
                                            {property.transaction.price && property.transaction.price > 0 && (
                                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                                    <div className="text-xs text-red-700 mb-1 font-semibold">Price</div>
                                                    <div className="text-2xl font-black text-red-600">
                                                        PKR {property.transaction.price.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.priceRange && (
                                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                                    <div className="text-xs text-red-700 mb-1 font-semibold">Price Range</div>
                                                    <div className="text-xl font-bold text-red-600">
                                                        {property.transaction.priceRange}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Rent Details */}
                                    {property.transaction.type === 'Rent' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {property.transaction.monthlyRent && property.transaction.monthlyRent > 0 && (
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="text-xs text-blue-700 mb-1 font-semibold">Monthly Rent</div>
                                                    <div className="text-xl font-bold text-blue-900">
                                                        PKR {property.transaction.monthlyRent.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.advanceAmount && property.transaction.advanceAmount > 0 && (
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="text-xs text-blue-700 mb-1 font-semibold">Advance Amount</div>
                                                    <div className="text-xl font-bold text-blue-900">
                                                        PKR {property.transaction.advanceAmount.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.contractDuration && (
                                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 sm:col-span-2">
                                                    <div className="text-xs text-blue-700 mb-1 font-semibold">Contract Duration</div>
                                                    <div className="text-base font-semibold text-blue-900">
                                                        {property.transaction.contractDuration}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Installment Details */}
                                    {property.transaction.type === 'Installment' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {property.transaction.bookingAmount && property.transaction.bookingAmount > 0 && (
                                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                                    <div className="text-xs text-green-700 mb-1 font-semibold">Booking Amount</div>
                                                    <div className="text-xl font-bold text-green-900">
                                                        PKR {property.transaction.bookingAmount.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.downPayment && property.transaction.downPayment > 0 && (
                                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                                    <div className="text-xs text-green-700 mb-1 font-semibold">Down Payment</div>
                                                    <div className="text-xl font-bold text-green-900">
                                                        PKR {property.transaction.downPayment.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.monthlyInstallment && property.transaction.monthlyInstallment > 0 && (
                                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                                    <div className="text-xs text-green-700 mb-1 font-semibold">Monthly Installment</div>
                                                    <div className="text-xl font-bold text-green-900">
                                                        PKR {property.transaction.monthlyInstallment.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.tenure && (
                                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                                    <div className="text-xs text-green-700 mb-1 font-semibold">Tenure</div>
                                                    <div className="text-base font-semibold text-green-900">
                                                        {property.transaction.tenure}
                                                    </div>
                                                </div>
                                            )}
                                            {property.transaction.totalPayable && property.transaction.totalPayable > 0 && (
                                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 sm:col-span-2">
                                                    <div className="text-xs text-purple-700 mb-1 font-semibold">Total Payable</div>
                                                    <div className="text-xl font-bold text-purple-900">
                                                        PKR {property.transaction.totalPayable.toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Additional Info */}
                                    {property.transaction.additionalInfo && (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-xs text-gray-700 mb-1 font-semibold">Additional Information</div>
                                            <div className="text-sm text-gray-900 whitespace-pre-line">
                                                {property.transaction.additionalInfo}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Units & Pricing (for Projects) */}
                        {property.type === "Project" && property.units && property.units.length > 0 && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Available Units & Pricing</h2>
                                <div className="space-y-4">
                                    {property.units.map((unit, idx) => (
                                        <div key={idx} className="border-2 border-gray-100 rounded-xl p-4 hover:border-red-200 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="size-8 bg-red-600 rounded-lg flex items-center justify-center">
                                                            <span className="text-white text-sm font-bold">{idx + 1}</span>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900">{unit.offeringType || `Unit ${idx + 1}`}</h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                                                        {unit.unitSize && (
                                                            <div>
                                                                <span className="font-semibold">Size:</span> {unit.unitSize} {unit.unitSizeUnit || ''}
                                                            </div>
                                                        )}
                                                        {unit.numberOfUnits && (
                                                            <div>
                                                                <span className="font-semibold">Available:</span> {unit.numberOfUnits} units
                                                            </div>
                                                        )}
                                                        {unit.transaction?.type && (
                                                            <div>
                                                                <span className="font-semibold">Type:</span> {unit.transaction.type}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right md:text-left md:min-w-[200px]">
                                                    {unit.transaction?.priceRange ? (
                                                        <div>
                                                            <div className="text-xl font-bold text-red-600">
                                                                {unit.transaction.priceRange}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Price Range</div>
                                                        </div>
                                                    ) : unit.transaction?.monthlyRent ? (
                                                        <div>
                                                            <div className="text-xl font-bold text-red-600">
                                                                PKR {unit.transaction.monthlyRent.toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">per month</div>
                                                        </div>
                                                    ) : unit.transaction?.bookingAmount ? (
                                                        <div>
                                                            <div className="text-xl font-bold text-red-600">
                                                                PKR {unit.transaction.bookingAmount.toLocaleString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Booking Amount</div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">Contact for Price</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Features & Amenities */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Features & Amenities</h2>
                            
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
                                                    <svg className="size-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Nearby Landmarks</h2>
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">{property.nearbyLandmarks}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Contact Card */}
                        {property.contact && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-4">
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
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
                                                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                </svg>
                                                WhatsApp
                                            </div>
                                        </a>
                                    )}
                                    <Link
                                        href={`/property/${property._id}/apply`}
                                        className="w-full mt-2 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-center block"
                                    >
                                        Apply Now
                                    </Link>
                                    {property.createdBy && (
                                        <Link
                                            href={`/partner/${encodeURIComponent(property.createdBy)}`}
                                            className="w-full mt-2 px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors text-center block"
                                        >
                                            View Partner Profile
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                        {!property.contact && property.createdBy && (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                                <Link
                                    href={`/partner/${encodeURIComponent(property.createdBy)}`}
                                    className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors text-center block"
                                >
                                    View Partner Profile
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Properties */}
                {relatedProperties.length > 0 && (
                    <div className="mt-8 sm:mt-12">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Related Properties</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {relatedProperties.map((related) => (
                                <Link
                                    key={related._id}
                                    href={`/property/${related._id}`}
                                    className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all overflow-hidden group"
                                >
                                    {related.images?.[0] ? (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={related.images[0]}
                                                alt={`${related.title} - ${related.propertyType || "Property"} in ${related.city || "Pakistan"}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">No Image</span>
                                        </div>
                                    )}
                                    <div className="p-3 sm:p-4">
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
