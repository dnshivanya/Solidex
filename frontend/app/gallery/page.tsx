'use client';

import Navbar from '../../components/Navbar';

export default function GalleryPage() {
  // Placeholder gallery items - you can replace with actual images
  const galleryItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Solidex Manufacturing ${i + 1}`,
    image: `https://via.placeholder.com/400x300?text=Solidex+${i + 1}`
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isPublic={true} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Gallery</h1>
            <p className="text-lg text-gray-600">
              Showcasing our manufacturing facility and products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-64 bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="text-white text-2xl font-bold">' + item.title + '</div>';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Note: Replace placeholder images with actual product and facility photos
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

