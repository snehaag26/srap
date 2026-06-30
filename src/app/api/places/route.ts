import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { category, city, country } = body;

    console.log("====================================");
    console.log("API KEY:", process.env.GOOGLE_MAPS_API_KEY);
    console.log("PUBLIC KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    console.log("Request body:", body);
    console.log("====================================");

    if (!category || !city) {
      return NextResponse.json(
        { error: 'Category and City are required' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Maps API key not configured');

      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    const searchQuery = `${category} in ${city}${country ? `, ${country}` : ''
      }`;

    console.log('Search Query:', searchQuery);

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri'
        },
        body: JSON.stringify({
          textQuery: searchQuery
        })
      }
    );

    console.log('Response Status:', response.status);

    const responseText = await response.text();

    console.log('Response Text:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Google Places API request failed',
          details: responseText
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    const places = (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      address: place.formattedAddress || '',
      phone: place.nationalPhoneNumber || '',
      website: place.websiteUri || '',
      rating: place.rating || 0,
      reviewCount: place.userRatingCount || 0
    }));

    return NextResponse.json(
      {
        success: true,
        count: places.length,
        places
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API Route Error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}